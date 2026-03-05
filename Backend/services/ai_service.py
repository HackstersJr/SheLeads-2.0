import os
from pydantic import BaseModel, Field
from typing import Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

# ── Schema ─────────────────────────────────────────────────────────────────────

class MapAction(BaseModel):
    lat: float = Field(description="Latitude to center the map on")
    lng: float = Field(description="Longitude to center the map on")
    zoom: int = Field(description="Zoom level from 1 to 20")

class UIAction(BaseModel):
    action: str = Field(description=(
        "The UI action to trigger. One of: "
        "'navigate' (switch to a tab), "
        "'show_farm' (open farm detail modal), "
        "'show_image' (show latest drone image for a farm), "
        "'show_soil' (show soil stats for a farm), "
        "'switch_language' (change the app language)"
    ))
    target: str = Field(description=(
        "For 'navigate': one of 'fields', 'alerts', 'voice'. "
        "For 'show_farm', 'show_image', 'show_soil': the farm_id. "
        "For 'switch_language': the BCP-47 language code, e.g. 'ta-IN', 'te-IN', 'hi-IN', 'en-IN', 'kn-IN', 'bn-IN', 'gu-IN', 'mr-IN', 'pa-IN'."
    ))

class StructuredAgentResponse(BaseModel):
    verbal_response: str = Field(description="The natural language verbal advice in the language requested.")
    map_action: Optional[MapAction] = Field(None, description="Coordinates to move the map to if referring to a specific location.")
    ui_action: Optional[UIAction] = Field(None, description="App UI action to trigger based on farmer's intent.")
    priority_level: str = Field(description="Priority: 'low', 'medium', or 'critical'")

# ── Mock Farm Registry (used as context for the LLM) ──────────────────────────

FARM_REGISTRY = """Farms: A=Cotton(2.5ac,pH6.8,moist42%,needs water) B=Wheat(1.8ac,pH7.1,moist68%,healthy) C=Rice(3ac,pH6.5,moist80%,harvest in 2wk). Latest drone: A(today) B(yesterday)"""

# ── AI Service ─────────────────────────────────────────────────────────────────

class AIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY", "dummy_key")
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=api_key,
            temperature=0,
            max_output_tokens=300,
        )

    async def process_farmer_query(self, query: str, context: str, lang: str = "HI") -> StructuredAgentResponse:
        system_msg = (
            "You are Kisan Mitra, a farming assistant. "
            "RULE: verbal_response MUST be in {lang} only. Never Hindi unless lang=HINDI. "
            "{farm_registry}"
        )
        human_msg = (
            "Query: {query}. Context: {context}.\n"
            "Actions (set ui_action if matches):\n"
            "navigate fields|alerts|voice / show_farm farm_id / show_image farm_id / show_soil farm_id / "
            "switch_language (Tamil=ta-IN,Telugu=te-IN,Hindi=hi-IN,English=en-IN,Kannada=kn-IN,Bengali=bn-IN,Gujarati=gu-IN,Marathi=mr-IN,Punjabi=pa-IN)\n"
            "Reply in {lang} only."
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_msg),
            ("human", human_msg),
        ])
        chain = prompt | self.llm.with_structured_output(StructuredAgentResponse)

        try:
            response = await chain.ainvoke({
                "query": query,
                "context": context,
                "lang": lang,
                "farm_registry": FARM_REGISTRY
            })
            return response
        except Exception as e:
            import traceback
            err_str = str(e)
            print(f"[Gemini ERROR] {type(e).__name__}: {err_str[:200]}")
            traceback.print_exc()
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                msg = "AI service is busy, please try again in a minute."
            else:
                msg = "Sorry, I am unable to process this right now."
            return StructuredAgentResponse(
                verbal_response=msg,
                priority_level="low"
            )

ai_service = AIService()


