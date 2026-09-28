# ── services/open_meteo.py ───────────────────────────────────────
"""
Fetches live ocean + weather data from Open-Meteo (no auth required).
Marine API: wave, SST, swell, currents.
Weather API: wind, temperature.
"""

import asyncio
import httpx
from datetime import datetime, timezone
from cache import ocean_cache, cache_key

MARINE_URL = "https://marine-api.open-meteo.com/v1/marine"
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

MARINE_VARS = (
    "wave_height,wave_direction,wave_period,"
    "swell_wave_height,swell_wave_direction,swell_wave_period,"
    "sea_surface_temperature,"
    "ocean_current_velocity,ocean_current_direction"
)

WEATHER_VARS = (
    "wind_speed_10m,wind_direction_10m," "visibility,precipitation_probability"
)


def _bearing_to_label(deg: float) -> str:
    dirs = [
        "N",
        "NNE",
        "NE",
        "ENE",
        "E",
        "ESE",
        "SE",
        "SSE",
        "S",
        "SSW",
        "SW",
        "WSW",
        "W",
        "WNW",
        "NW",
        "NNW",
    ]
    return dirs[round(deg / 22.5) % 16]


def _visibility_label(vis_m: float | None) -> str:
    if vis_m is None:
        return "Unknown"
    if vis_m >= 10000:
        return "Excellent"
    if vis_m >= 5000:
        return "Good"
    if vis_m >= 2000:
        return "Moderate"
    return "Poor"


async def fetch_ocean_conditions(lat: float, lon: float) -> dict:
    key = cache_key(lat, lon, "ocean")
    if key in ocean_cache:
        return ocean_cache[key]

    async with httpx.AsyncClient(timeout=15.0) as client:
        marine_task = client.get(
            MARINE_URL,
            params={
                "latitude": lat,
                "longitude": lon,
                "hourly": MARINE_VARS,
                "current": MARINE_VARS,
                "timezone": "Asia/Kolkata",
                "forecast_days": 2,
            },
        )
        weather_task = client.get(
            WEATHER_URL,
            params={
                "latitude": lat,
                "longitude": lon,
                "hourly": WEATHER_VARS,
                "current": WEATHER_VARS,
                "wind_speed_unit": "kmh",
                "timezone": "Asia/Kolkata",
                "forecast_days": 2,
            },
        )

        marine_resp, weather_resp = await asyncio.gather(marine_task, weather_task)

    marine = marine_resp.json()
    weather = weather_resp.json()

    # Current values (first index of current object from API)
    mc = marine.get("current", {})
    wc = weather.get("current", {})

    wind_dir = wc.get("wind_direction_10m", 0) or 0
    vis_raw = wc.get("visibility", None)

    # Build hourly forecast for next 24h
    m_hourly = marine.get("hourly", {})
    w_hourly = weather.get("hourly", {})
    times = m_hourly.get("time", [])[:24]
    forecast = []
    for i, t in enumerate(times):
        forecast.append(
            {
                "hour": t[11:16],  # HH:MM
                "wave_height": round(m_hourly.get("wave_height", [0])[i] or 0, 1),
                "wind_speed": round(w_hourly.get("wind_speed_10m", [0])[i] or 0, 1),
                "sst": round(m_hourly.get("sea_surface_temperature", [28])[i] or 28, 1),
            }
        )

    result = {
        "lat": lat,
        "lon": lon,
        "sst": round(mc.get("sea_surface_temperature") or 28.0, 1),
        "wave_height": round(mc.get("wave_height") or 1.0, 1),
        "wave_direction": round(mc.get("wave_direction") or 225.0, 0),
        "wave_period": round(mc.get("wave_period") or 8.0, 1),
        "swell_height": round(mc.get("swell_wave_height") or 0.8, 1),
        "swell_direction": round(mc.get("swell_wave_direction") or 220.0, 0),
        "wind_speed": round(wc.get("wind_speed_10m") or 12.0, 1),
        "wind_direction": round(wind_dir, 0),
        "wind_direction_label": _bearing_to_label(wind_dir),
        "current_velocity": round(mc.get("ocean_current_velocity") or 0.5, 2),
        "current_direction": round(mc.get("ocean_current_direction") or 180.0, 0),
        "visibility": _visibility_label(vis_raw),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "forecast_24h": forecast,
        "source": "Open-Meteo Marine API + Weather API",
    }

    ocean_cache[key] = result
    return result
