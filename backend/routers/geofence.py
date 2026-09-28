# ── routers/geofence.py ──────────────────────────────────────────
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.geofence_service import check_geofence

router = APIRouter(prefix="/api/geofence", tags=["Geofence"])


class GeofenceRequest(BaseModel):
    lat: float
    lon: float
    vessel_id: Optional[str] = "unknown"


@router.post("/check")
async def check_position(req: GeofenceRequest):
    """
    Checks if a vessel position is within India EEZ / territorial waters.
    Returns distance to IMBL, EEZ boundary, nearest port, and safety warning.
    Uses Shapely geometry on pre-loaded GeoJSON boundaries.
    """
    try:
        result = check_geofence(req.lat, req.lon)
        result["vessel_id"] = req.vessel_id
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/check")
async def check_position_get(lat: float, lon: float):
    """GET version for easy browser testing."""
    try:
        return check_geofence(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
