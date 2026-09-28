# ── routers/fishing.py ───────────────────────────────────────────
from fastapi import APIRouter, Query, HTTPException
from services.incois import fetch_pfz_zones
from services.open_meteo import fetch_ocean_conditions
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/api/fishing", tags=["Fishing"])

SPECIES_DEPTH_INFO = {
    "Sardine": {"depth": "10-50m", "peak": "Early morning", "emoji": "🐟"},
    "Mackerel": {"depth": "30-80m", "peak": "Evening", "emoji": "🐠"},
    "Tuna": {"depth": "50-150m", "peak": "Midday", "emoji": "🐡"},
    "Pomfret": {"depth": "15-40m", "peak": "Morning", "emoji": "🦈"},
    "Anchovy": {"depth": "5-30m", "peak": "Dawn", "emoji": "🐟"},
    "Anchovies": {"depth": "5-30m", "peak": "Dawn", "emoji": "🐟"},
    "Croaker": {"depth": "20-60m", "peak": "Morning", "emoji": "🐠"},
    "Hilsa": {"depth": "10-40m", "peak": "Evening", "emoji": "🐟"},
}


@router.get("/pfz")
async def get_pfz_zones(
    lat: float = Query(..., ge=5, le=25, description="Latitude (Indian coast)"),
    lon: float = Query(..., ge=60, le=100, description="Longitude"),
    radius_km: float = Query(150, ge=10, le=500),
):
    """
    Returns Potential Fishing Zones near the given coordinates.
    Data from INCOIS PFZ Advisory + ERDDAP Chlorophyll enrichment.
    Cached for 6 hours.
    """
    try:
        pfz_data = await fetch_pfz_zones(lat, lon, radius_km)
        ocean = await fetch_ocean_conditions(lat, lon)

        # Enrich each zone with live SST from Open-Meteo
        for zone in pfz_data["zones"]:
            zone["sst"] = ocean.get("sst", 28.0)

        return pfz_data
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"PFZ data unavailable: {str(e)}")


@router.get("/outlook")
async def get_fishing_outlook(
    lat: float = Query(..., ge=5, le=25),
    lon: float = Query(..., ge=60, le=100),
):
    """Returns 5-day fishing score outlook based on forecast conditions."""
    try:
        from services.safety_engine import compute_hourly_score, VESSEL_THRESHOLDS
        import httpx

        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(
                "https://marine-api.open-meteo.com/v1/marine",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "daily": "wave_height_max,wind_speed_10m_max",
                    "hourly": "wave_height,sea_surface_temperature",
                    "timezone": "Asia/Kolkata",
                    "forecast_days": 7,
                },
            )
            wr = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "daily": "wind_speed_10m_max,precipitation_sum,weathercode",
                    "wind_speed_unit": "kmh",
                    "timezone": "Asia/Kolkata",
                    "forecast_days": 7,
                },
            )

        marine = r.json()
        weather = wr.json()

        m_daily = marine.get("daily", {})
        w_daily = weather.get("daily", {})

        WEATHER_EMOJI = {
            0: "☀️",
            1: "🌤",
            2: "⛅",
            3: "☁️",
            45: "🌫",
            48: "🌫",
            51: "🌦",
            61: "🌧",
            71: "🌨",
            80: "🌧",
            95: "⛈",
        }

        thresholds = VESSEL_THRESHOLDS["mechanized"]
        days = m_daily.get("time", [])[:5]
        outlook = []
        for i, day in enumerate(days):
            wave = m_daily.get("wave_height_max", [1.5])[i] or 1.5
            wind = w_daily.get("wind_speed_10m_max", [15])[i] or 15
            code = w_daily.get("weathercode", [0])[i] or 0
            score = compute_hourly_score(
                {"wave_height": wave, "wind_speed": wind}, thresholds
            )
            dt = datetime.fromisoformat(day)
            outlook.append(
                {
                    "date": day,
                    "day": dt.strftime("%a"),
                    "score": score,
                    "weather": WEATHER_EMOJI.get(code, "⛅"),
                    "wave_height": round(wave, 1),
                    "wind_speed": round(wind, 1),
                    "recommendation": (
                        "Excellent"
                        if score >= 80
                        else (
                            "Good"
                            if score >= 65
                            else "Moderate" if score >= 45 else "Poor — Avoid"
                        )
                    ),
                }
            )
        return {
            "lat": lat,
            "lon": lon,
            "outlook": outlook,
            "source": "Open-Meteo 7-day forecast",
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/species")
async def get_species_info():
    """Returns species intelligence data."""
    species = []
    for name, info in SPECIES_DEPTH_INFO.items():
        species.append(
            {
                "name": name,
                "emoji": info["emoji"],
                "depth_range": info["depth"],
                "peak_activity": info["peak"],
            }
        )
    return {"species": species}
