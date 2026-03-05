from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from middleware.gps_fence import VerifyGPSFence
from routers import telemetry, ai_agent

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: 
    # Firebase is already lazy-loaded in firebase_service.py but we can explicitly trigger it here
    print("Project Gram-Drishti Backend starting up...")
    yield
    # Shutdown logic
    print("Backend shutting down...")

app = FastAPI(
    title="Gram-Drishti API",
    description="Backend services for AI-driven Agritech Drone ecosystem",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup for PWA local network access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In prod, restrict to PWA domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Application security middleware
# app.add_middleware(VerifyGPSFence) # Disabled globally for now to allow local testing without valid farmers DB

# Mount Routers
app.include_router(telemetry.router, prefix="/telemetry", tags=["Drone Telemetry"])
app.include_router(ai_agent.router, prefix="/api/ai", tags=["Kisan Mitra AI"])

@app.get("/")
async def root():
    return {"status": "ok", "message": "Gram-Drishti API is running."}
