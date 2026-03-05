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

FARM_REGISTRY = """
Farmer's Registered Farms:
1. Farm A (farm_a) – Cotton crop, 2.5 acres, pH 6.8, moisture 42% → Status: Needs water urgently
2. Farm B (farm_b) – Wheat crop, 1.8 acres, pH 7.1, moisture 68% → Status: Healthy
3. Farm C (farm_c) – Rice crop, 3.0 acres, pH 6.5, moisture 80% → Status: Healthy, ready to harvest in 2 weeks
Latest drone image available for: Farm A (taken today), Farm B (taken yesterday)
"""

# ── AI Service ─────────────────────────────────────────────────────────────────

class AIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY", "dummy_key")
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0.2,
        )

    async def process_farmer_query(self, query: str, context: str, lang: str = "HI") -> StructuredAgentResponse:
        system_msg = (
            "You are 'Kisan Mitra', an agricultural assistant for Indian farmers. "
            "ABSOLUTE RULE: Your entire verbal_response MUST be written in {lang} script and language. "
            "It is FORBIDDEN to respond in Hindi unless the language is explicitly HINDI. "
            "Do not mix languages. Do not use Hindi words in a Tamil or Telugu response. "
            "If {lang} is TAMIL, write Tamil. If TELUGU, write Telugu. Etc. "
            "\n\n{farm_registry}"
        )
        human_msg = (
            "Query: {query}\n"
            "Field Context: {context}\n\n"
            "Actions you can trigger:\n"
            "- If farmer asks about farms/fields: ui_action navigate to 'fields'\n"
            "- If farmer wants to open a specific farm: ui_action show_farm with target farm_id\n"
            "- If farmer asks for drone image: ui_action show_image\n"
            "- If farmer asks about alerts: ui_action navigate to 'alerts'\n"
            "- If farmer asks for soil data: ui_action show_soil\n"
            "- If farmer asks to switch/speak in another language (e.g. 'Tamil mein bolo', 'switch to Telugu', 'speak English'): "
            "  ui_action switch_language, target BCP-47 code: Tamil=ta-IN, Telugu=te-IN, Hindi=hi-IN, English=en-IN, Kannada=kn-IN, Bengali=bn-IN, Gujarati=gu-IN, Marathi=mr-IN, Punjabi=pa-IN\n\n"
            "REMEMBER: Respond verbal_response in {lang} ONLY. Not Hindi. Not English. {lang}."
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


