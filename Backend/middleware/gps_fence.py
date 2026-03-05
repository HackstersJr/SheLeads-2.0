import json
from shapely.geometry import Point, Polygon
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from services.firebase_service import get_db

class VerifyGPSFence(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # We only apply this check on specific endpoints like /telemetry/update, /sensors/update
        # For WebSockets, middleware is bypassed, so WebSockets must manually call the verification logic.
        
        farmer_id = request.headers.get("X-Farmer-ID")
        
        if request.url.path.startswith("/api/secure") or request.method in ["POST", "PUT"]:
            # If the endpoint requires fence verification:
            if not farmer_id:
                return JSONResponse(status_code=403, content={"error": "Missing X-Farmer-ID header"})

            try:
                # Need to read the body to extract lat, lng
                # Reading body in middleware can be tricky, we'll parse JSON if possible
                body = await request.body()
                if body:
                    data = json.loads(body)
                    lat = data.get("lat")
                    lng = data.get("lng")
                    
                    if lat is not None and lng is not None:
                        is_within_fence = await self._verify_fence(farmer_id, lat, lng)
                        if not is_within_fence:
                            return JSONResponse(status_code=403, content={"error": "Coordinates outside farmer's designated plot."})
                        
                        # Inject matched_farm_id
                        request.state.matched_farm_id = farmer_id

            except Exception as e:
                # If body isn't JSON or other errors
                pass
                
        response = await call_next(request)
        return response

    async def _verify_fence(self, farmer_id: str, lat: float, lng: float) -> bool:
        """
        Fetches the farmer's plot polygon from Firestore and checks if (lat, lng) is inside.
        """
        try:
            db = get_db()
            doc_ref = db.collection('farmers').document(farmer_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return False
                
            plot_boundary = doc.to_dict().get('plot_boundary', [])
            if not plot_boundary or len(plot_boundary) < 3:
                return False
                
            # plot_boundary represents a list of dicts: [{'lat': 12.3, 'lng': 45.6}, ...]
            polygon_coords = [(pt['lng'], pt['lat']) for pt in plot_boundary]
            farm_polygon = Polygon(polygon_coords)
            
            incoming_point = Point(lng, lat)
            return farm_polygon.contains(incoming_point)
            
        except Exception as e:
            print(f"Error validating GPS fence: {e}")
            return False
