# ── routers/alerts.py ────────────────────────────────────────────
from fastapi import APIRouter, Query, HTTPException
from services.imd import fetch_alerts

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("")
async def get_alerts(
    lat: float = Query(..., ge=5, le=25),
    lon: float = Query(..., ge=60, le=100),
):
    """
    Returns real-time marine alerts — wave warnings, wind warnings,
    fishing bans, and PFZ advisories. Aggregated from Open-Meteo + IMD.
    Cached for 15 minutes.
    """
    try:
        return await fetch_alerts(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
