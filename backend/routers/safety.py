# ── routers/safety.py ────────────────────────────────────────────
from fastapi import APIRouter, Query, HTTPException
from services.open_meteo import fetch_ocean_conditions
from services.geofence_service import check_geofence
from services.safety_engine import compute_safety_score

router = APIRouter(prefix="/api/safety", tags=["Safety"])

VESSEL_TYPES = ["small", "country", "mechanized", "large"]


@router.get("")
async def get_safety_score(
    lat: float = Query(..., ge=5, le=25),
    lon: float = Query(..., ge=60, le=100),
    vessel_type: str = Query(
        "mechanized", description="small | country | mechanized | large"
    ),
):
    """
    Computes real-time vessel safety score (0-100) using live ocean data.
    Returns conditions breakdown, recommendation, and 24h safety forecast.
    """
    if vessel_type not in VESSEL_TYPES:
        raise HTTPException(
            status_code=422, detail=f"vessel_type must be one of {VESSEL_TYPES}"
        )
    try:
        ocean = await fetch_ocean_conditions(lat, lon)
        geo = check_geofence(lat, lon)
        safety = compute_safety_score(ocean, vessel_type)

        return {
            "lat": lat,
            "lon": lon,
            **safety,
            "distance_to_imbl_km": geo["distance_to_imbl_km"],
            "inside_india_eez": geo["inside_india_eez"],
            "geofence_warning": geo["warning"],
            "nearest_port": geo["nearest_port"],
            "nearest_port_distance_km": geo["nearest_port_distance_km"],
            "sst": ocean["sst"],
            "wave_height": ocean["wave_height"],
            "wind_speed": ocean["wind_speed"],
            "wind_direction_label": ocean["wind_direction_label"],
            "source": "Open-Meteo Marine + ORCA Safety Engine",
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
