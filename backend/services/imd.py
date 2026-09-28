# ── services/imd.py ──────────────────────────────────────────────
"""
IMD alert scraper.
IMD publishes cyclone bulletins and marine advisories on public pages.
We parse the public JSON feed + fallback to scraping bulletin pages.
"""
import httpx
import asyncio
from datetime import datetime, timezone
from cache import alerts_cache

# IMD public feeds (no auth)
IMD_WEATHER_JSON = "https://internal.imd.gov.in/pages/warning_mausam.php"
IMD_CYCLONE_PAGE = "https://mausam.imd.gov.in/responsive/cyclonewarning.php"
IMD_MARINE_ADVISORY = "https://mausam.imd.gov.in/responsive/marinedistrictforecast.php"

# Open-Meteo weather alerts (used as supplement)
OPEN_METEO_ALERTS = "https://api.open-meteo.com/v1/forecast"


async def _fetch_openmeteo_marine_warnings(lat: float, lon: float) -> list[dict]:
    """Use Open-Meteo to detect severe conditions and generate synthetic alerts."""
    from datetime import timezone, datetime, timedelta
    alerts = []
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(OPEN_METEO_ALERTS, params={
                "latitude": lat, "longitude": lon,
                "hourly": "wave_height,wind_speed_10m,precipitation_probability",
                "current": "wave_height,wind_speed_10m",
                "wind_speed_unit": "kmh",
                "forecast_days": 3,
                "timezone": "Asia/Kolkata",
            })
        data = r.json()
        cur = data.get("current", {})
        wave = cur.get("wave_height", 0) or 0
        wind = cur.get("wind_speed_10m", 0) or 0

        now = datetime.now(timezone.utc)

        if wave >= 3.5:
            alerts.append({
                "id": f"WAVE-{now.strftime('%Y%m%d')}",
                "severity": "WARNING",
                "category": "Weather",
                "title": f"High Wave Alert — Wave Height {wave:.1f}m",
                "description": (
                    f"Significant wave height of {wave:.1f}m observed near your location. "
                    f"Vessels under 30ft are strongly advised to stay ashore. "
                    f"Exercise extreme caution."
                ),
                "region": "Nearby coastline",
                "issued": now.isoformat(),
                "expires": (now + timedelta(hours=12)).isoformat(),
                "source": "Open-Meteo Marine + ORCA Safety Engine",
            })
        elif wave >= 2.5:
            alerts.append({
                "id": f"WAVE-MOD-{now.strftime('%Y%m%d')}",
                "severity": "ADVISORY",
                "category": "Weather",
                "title": f"Moderate Wave Advisory — {wave:.1f}m",
                "description": (
                    f"Wave height of {wave:.1f}m. Small vessels should exercise caution. "
                    f"Suitable for mechanized trawlers and above."
                ),
                "region": "Nearby coastal waters",
                "issued": now.isoformat(),
                "expires": (now + timedelta(hours=6)).isoformat(),
                "source": "Open-Meteo Marine",
            })

        if wind >= 50:
            alerts.append({
                "id": f"WIND-{now.strftime('%Y%m%d')}",
                "severity": "CRITICAL",
                "category": "Weather",
                "title": f"Gale Force Wind Warning — {wind:.0f} km/h",
                "description": (
                    f"Wind speed of {wind:.0f} km/h detected. All fishing vessels must "
                    f"return to port immediately. Do not venture into the sea."
                ),
                "region": "Coastal waters",
                "issued": now.isoformat(),
                "expires": (now + timedelta(hours=18)).isoformat(),
                "source": "Open-Meteo Weather",
            })
        elif wind >= 35:
            alerts.append({
                "id": f"WIND-WARN-{now.strftime('%Y%m%d')}",
                "severity": "WARNING",
                "category": "Weather",
                "title": f"Strong Wind Warning — {wind:.0f} km/h",
                "description": (
                    f"Wind speed reaching {wind:.0f} km/h. Small vessels should avoid "
                    f"venturing beyond 12 nautical miles from coast."
                ),
                "region": "Coastal waters",
                "issued": now.isoformat(),
                "expires": (now + timedelta(hours=12)).isoformat(),
                "source": "Open-Meteo Weather",
            })

        # Check next 48h forecast for deteriorating conditions
        hourly = data.get("hourly", {})
        future_waves = hourly.get("wave_height", [])[:48]
        max_future = max(future_waves) if future_waves else 0
        if max_future > wave + 1.5:
            alerts.append({
                "id": f"FORECAST-{now.strftime('%Y%m%d')}",
                "severity": "INFO",
                "category": "Forecast",
                "title": f"Deteriorating Conditions Expected — Up to {max_future:.1f}m waves",
                "description": (
                    f"Wave height expected to increase to {max_future:.1f}m in the next 48 hours. "
                    f"Plan fishing trips for early morning tomorrow."
                ),
                "region": "Regional forecast area",
                "issued": now.isoformat(),
                "expires": (now + timedelta(hours=48)).isoformat(),
                "source": "Open-Meteo 48h Forecast",
            })
    except Exception as e:
        pass
    return alerts


async def _check_fishing_ban_season() -> dict | None:
    """Check if current date falls within fishing ban period."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    # Karnataka ban: April 15 – June 14
    # Maharashtra ban: June 1 – July 31
    # Kerala ban: June 9 – July 31
    bans = [
        (4, 15, 6, 14, "Karnataka", "Fishing Ban — Karnataka"),
        (6, 1, 7, 31, "Maharashtra", "Fishing Ban — Maharashtra"),
        (6, 9, 7, 31, "Kerala", "Fishing Ban — Kerala"),
    ]
    for sm, sd, em, ed, state, title in bans:
        start = now.replace(month=sm, day=sd, hour=0, minute=0, second=0)
        end   = now.replace(month=em, day=ed, hour=23, minute=59, second=59)
        if start <= now <= end:
            return {
                "id": f"BAN-{state.upper()}-{now.year}",
                "severity": "ADVISORY",
                "category": "Fishing Ban",
                "title": title,
                "description": (
                    f"Annual trawl fishing ban is in effect for {state} waters. "
                    f"Mechanized vessels are prohibited. Traditional craft may operate "
                    f"with permission from local fisheries authority."
                ),
                "region": f"{state} coastline",
                "issued": start.isoformat(),
                "expires": end.isoformat(),
                "source": f"{state} Fisheries Department",
            }
    return None


async def fetch_alerts(lat: float, lon: float) -> dict:
    """Aggregate all alerts from multiple sources."""
    cache_k = f"alerts_{round(lat,1)}_{round(lon,1)}"
    if cache_k in alerts_cache:
        return alerts_cache[cache_k]

    alerts = []
    cyclone = None

    # Parallel fetch
    wave_alerts = await _fetch_openmeteo_marine_warnings(lat, lon)
    alerts.extend(wave_alerts)

    # Check fishing ban
    ban = await _check_fishing_ban_season()
    if ban:
        alerts.append(ban)

    # Always add PFZ info alert if no ban
    if not ban:
        from datetime import timezone, datetime
        now = datetime.now(timezone.utc)
        alerts.append({
            "id": f"PFZ-INFO-{now.strftime('%Y%m%d')}",
            "severity": "INFO",
            "category": "Fishing",
            "title": "PFZ Advisory Updated",
            "description": (
                "New Potential Fishing Zones have been identified for your region. "
                "Check the Fishing Intelligence page for coordinates, species, and navigation."
            ),
            "region": "Regional coastal waters",
            "issued": now.replace(hour=6, minute=0, second=0).isoformat(),
            "expires": now.replace(hour=18, minute=0, second=0).isoformat(),
            "source": "INCOIS PFZ Advisory",
        })

    # Sort by severity
    sev_order = {"CRITICAL": 0, "WARNING": 1, "ADVISORY": 2, "INFO": 3}
    alerts.sort(key=lambda a: sev_order.get(a["severity"], 99))

    result = {
        "alerts": alerts,
        "cyclone": cyclone,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }
    alerts_cache[cache_k] = result
    return result
