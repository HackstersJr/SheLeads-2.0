from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import asyncio

# Assuming firebase db getter
from services.firebase_service import get_db

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/{farmer_id}")
async def telemetry_endpoint(websocket: WebSocket, farmer_id: str):
    """
    WebSocket endpoint for real-time MAVLink telemetry ingestion.
    Expects JSON containing drone lat/lng and status.
    """
    await manager.connect(websocket)
    try:
        db = get_db()
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                
                # Here we could manually invoke Shapely fence logic
                # Since we bypassed middleware for WebSockets
                
                # Example payload: {"lat": 12.3, "lng": 45.6, "alt": 10, "battery": 85, "status": "surveying"}
                lat = payload.get("lat")
                lng = payload.get("lng")
                
                if lat and lng:
                    # Update firestore drone location live
                    db.collection("drones").document(farmer_id).set({
                        "location": {"lat": lat, "lng": lng},
                        "status": payload.get("status", "unknown"),
                        "last_updated": firestore.SERVER_TIMESTAMP # type: ignore (handled by firebase)
                    }, merge=True)
                    
                    # If drone flags survey complete
                    if payload.get("status") == "survey_complete":
                        # Trigger background processing
                        await manager.broadcast(json.dumps({"event": "survey_finished", "farmer_id": farmer_id}))
                        
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"Error in telemetry websocket: {e}")
        manager.disconnect(websocket)
