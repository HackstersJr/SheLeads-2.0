import os
import httpx
import base64
import json
from io import BytesIO

class SarvamService:
    def __init__(self):
        self.base_url = "https://api.sarvam.ai"
        
    async def speech_to_text(self, audio_bytes: bytes, language_code: str = "hi-IN") -> str:
        """
        Sends raw audio bytes to Sarvam's Speech-to-Text API (Saaras v3).
        Returns the transcribed text.
        """
        api_key = os.getenv("SARVAM_API_KEY", "")
        if not api_key:
            print("WARNING: SARVAM_API_KEY not found in environment.")
            # Fallback for local testing without key
            return "मेरे खेत में नमी कम है" # "My field has low moisture" in Hindi

        headers = {
            "api-subscription-key": api_key
        }
        
        # Sarvam expects a multipart/form-data with the file
        files = {
            "file": ("audio.wav", audio_bytes, "audio/wav")
        }
        data = {
            "model": "saaras:v3", # Use the latest recommended model
            "language_code": language_code,
            "with_timesteps": "false"
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/speech-to-text",
                    headers=headers,
                    files=files,
                    data=data,
                    timeout=30.0
                )
                
            response.raise_for_status()
            result = response.json()
            return result.get("transcript", "")
            
        except Exception as e:
            print(f"Error in Sarvam ASR: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(e.response.text)
            return "Translation failed. Please try again."

    async def translate(self, text: str, source_lang: str = "hi-IN", target_lang: str = "ta-IN") -> str:
        """Translate text using Sarvam API. Falls back to original text on any error."""
        api_key = os.getenv("SARVAM_API_KEY", "")
        if not api_key or not text.strip() or source_lang == target_lang:
            return text
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/translate",
                    headers={"api-subscription-key": api_key, "Content-Type": "application/json"},
                    json={
                        "input": text,
                        "source_language_code": source_lang,
                        "target_language_code": target_lang,
                        "speaker_gender": "Female",
                        "mode": "formal",
                        "enable_preprocessing": True,
                    },
                    timeout=20.0
                )
            response.raise_for_status()
            return response.json().get("translated_text", text)
        except Exception as e:
            print(f"Sarvam translate error (non-fatal): {e}")
            return text

    async def text_to_speech(self, text: str, target_lang: str = "hi-IN", speaker: str = "") -> str:
        """
        Sends text to Sarvam's Text-to-Speech API (Bulbul v3).
        Returns a base64 encoded string of the generated audio (WAV).
        """
        api_key = os.getenv("SARVAM_API_KEY", "")
        if not api_key:
            return "" # Return empty base64 string on failure

        # Sarvam Bulbul v3 speaker map — one native voice per language
        SPEAKER_MAP = {
            "hi-IN": "amit",    # Hindi
            "kn-IN": "sumit",   # Kannada
            "ta-IN": "manan",   # Tamil
            "te-IN": "rahul",   # Telugu
            "bn-IN": "simran",  # Bengali
            "gu-IN": "manan",   # Gujarati
            "mr-IN": "rahul",   # Marathi
            "pa-IN": "amit",    # Punjabi
            "en-IN": "manan",   # English
        }
        if not speaker:
            speaker = SPEAKER_MAP.get(target_lang, "amit")

        headers = {
            "api-subscription-key": api_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": [text],
            "target_language_code": target_lang,
            "speaker": speaker,
            "enable_preprocessing": True,
            "model": "bulbul:v3"
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/text-to-speech",
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
            
            response.raise_for_status()
            result = response.json()
            
            audios = result.get("audios", [])
            if audios:
                return audios[0] # Returns base64 encoded audio string
            return ""
            
        except Exception as e:
            print(f"Error in Sarvam TTS: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(e.response.text)
            return ""

sarvam_service = SarvamService()
