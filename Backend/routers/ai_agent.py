from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import base64
import time
import logging
from services.ai_service import ai_service, StructuredAgentResponse
from services.sarvam_service import sarvam_service

# Configure a named logger for the voice pipeline
logger = logging.getLogger("voice_pipeline")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")

router = APIRouter()

class QueryRequest(BaseModel):
    query: str
    context: str = "General farming overview"
    language: str = "HI"

class VoiceRequest(BaseModel):
    audio_base64: str
    context: str = "General farming overview"
    language: str = "hi-IN" # Sarvam expected language string

class VoiceAgentResponse(BaseModel):
    transcript: str
    structured_response: StructuredAgentResponse
    tts_audio_base64: str

@router.post("/ask", response_model=StructuredAgentResponse)
async def ask_kisan_mitra(request: Request, payload: QueryRequest):
    """
    Endpoint for the frontend to ask the LangChain AI agent a text question.
    """
    farmer_id = request.headers.get("X-Farmer-ID", "unknown")
    augmented_context = f"{payload.context} | Farmer ID: {farmer_id}"
    
    response = await ai_service.process_farmer_query(
        query=payload.query,
        context=augmented_context,
        lang=payload.language
    )
    return response

@router.post("/voice", response_model=VoiceAgentResponse)
async def voice_kisan_mitra(request: Request, payload: VoiceRequest):
    """
    End-to-end voice pipeline endpoint.
    1. Base64 Audio -> Sarvam ASR Text
    2. ASR Text -> Gemini Reasoning Space
    3. Gemini Verbal -> Sarvam TTS Audio Base64
    """
    farmer_id = request.headers.get("X-Farmer-ID", "unknown")
    augmented_context = f"{payload.context} | Farmer ID: {farmer_id}"
    pipeline_start = time.time()
    
    logger.info(f"=== VOICE PIPELINE START | farmer={farmer_id} | lang={payload.language} ===")
    logger.info(f"Audio B64 length: {len(payload.audio_base64)} chars")
    
    try:
        # ── Step 0: Decode audio ──
        b64_string = payload.audio_base64
        if ',' in b64_string:
            b64_string = b64_string.split(',')[1]
        missing_padding = len(b64_string) % 4
        if missing_padding:
            b64_string += '=' * (4 - missing_padding)
        audio_bytes = base64.b64decode(b64_string)
        logger.info(f"[Step 0] Decoded audio: {len(audio_bytes)} bytes")
        
        # ── Step 1: Speech-to-Text (Sarvam Saaras) ──
        t1 = time.time()
        logger.info(f"[Step 1] Calling Sarvam ASR (language={payload.language})...")
        transcript = await sarvam_service.speech_to_text(audio_bytes, payload.language)
        logger.info(f"[Step 1] ASR done in {(time.time()-t1)*1000:.0f}ms | transcript='{transcript}'")
        
        if not transcript:
            transcript = "नमस्ते"
            logger.warning("[Step 1] Empty transcript, falling back to 'नमस्ते'")

        # ── Step 2: Gemini LangChain Processing ──
        t2 = time.time()
        # Map Sarvam language code to a human-readable language name for Gemini
        lang_map = {
            "hi-IN": "HINDI", "en-IN": "ENGLISH", "ta-IN": "TAMIL",
            "te-IN": "TELUGU", "kn-IN": "KANNADA", "bn-IN": "BENGALI",
            "gu-IN": "GUJARATI", "mr-IN": "MARATHI", "pa-IN": "PUNJABI",
        }
        gemini_lang = lang_map.get(payload.language.lower(), "HINDI")
        logger.info(f"[Step 2] Calling Gemini AI (lang={gemini_lang}, query='{transcript[:80]}')...")
        ai_response = await ai_service.process_farmer_query(
            query=transcript,
            context=augmented_context,
            lang=gemini_lang
        )
        logger.info(f"[Step 2] Gemini done in {(time.time()-t2)*1000:.0f}ms | verbal='{ai_response.verbal_response[:80]}'")

        # ── Step 2.5: Translate if target language is not Hindi/English ──
        verbal_text = ai_response.verbal_response
        if payload.language not in ("hi-IN", "en-IN"):
            t_translate = time.time()
            logger.info(f"[Step 2.5] Translating to {payload.language} via Sarvam...")
            verbal_text = await sarvam_service.translate(
                text=verbal_text,
                source_lang="hi-IN",      # Gemini defaults to Hindi
                target_lang=payload.language
            )
            logger.info(f"[Step 2.5] Translate done in {(time.time()-t_translate)*1000:.0f}ms | '{verbal_text[:80]}'")

        # ── Step 3: Text-to-Speech (Sarvam Bulbul) ──
        t3 = time.time()
        logger.info(f"[Step 3] Calling Sarvam TTS...")
        tts_base64 = await sarvam_service.text_to_speech(
            text=verbal_text,
            target_lang=payload.language
        )

        tts_len = len(tts_base64) if tts_base64 else 0
        logger.info(f"[Step 3] TTS done in {(time.time()-t3)*1000:.0f}ms | audio_b64_len={tts_len}")
        
        total_ms = (time.time() - pipeline_start) * 1000
        logger.info(f"=== VOICE PIPELINE COMPLETE in {total_ms:.0f}ms ===")
        
        return VoiceAgentResponse(
            transcript=transcript,
            structured_response={
                **ai_response.model_dump(),
                "verbal_response": verbal_text  # Use translated text for display
            },
            tts_audio_base64=tts_base64
        )
        
    except Exception as e:
        import traceback
        total_ms = (time.time() - pipeline_start) * 1000
        logger.error(f"=== VOICE PIPELINE FAILED after {total_ms:.0f}ms ===")
        logger.error(f"Error: {type(e).__name__}: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Voice processing pipeline failed: {str(e)}")

