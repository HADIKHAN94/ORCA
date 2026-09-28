# ── routers/ocean.py ─────────────────────────────────────────────
import asyncio
from fastapi import APIRouter, Query, HTTPException
from services.open_meteo import fetch_ocean_conditions

router = APIRouter(prefix="/api/ocean", tags=["Ocean"])


@router.get("")
async def get_ocean_conditions(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
):
    """
    Returns live ocean conditions from Open-Meteo Marine + Weather APIs.
    Includes SST, wave height, wind, currents, visibility.
    Cached for 1 hour per 0.1° grid cell.
    """
    try:
        data = await fetch_ocean_conditions(lat, lon)
        return data
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Ocean data unavailable: {str(e)}")


@router.get("/forecast")
async def get_ocean_forecast(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
):
    """Returns 24-hour hourly ocean forecast."""
    try:
        data = await fetch_ocean_conditions(lat, lon)
        return {
            "lat": lat,
            "lon": lon,
            "hourly": data.get("forecast_24h", []),
            "source": data.get("source"),
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/history")
async def get_ocean_history(lat: float, lon: float, days: int = 30):
    # Mocked 30-day history for the Research Dashboard
    import datetime, random

    history = []
    base_sst = 28.0
    base_wave = 1.5
    for i in range(days):
        date = (
            datetime.datetime.utcnow() - datetime.timedelta(days=days - i)
        ).strftime("%Y-%m-%d")
        history.append(
            {
                "date": date,
                "sst": round(base_sst + random.uniform(-1, 1), 1),
                "wave_height": round(base_wave + random.uniform(-0.5, 0.5), 1),
            }
        )
    return {"history": history}
