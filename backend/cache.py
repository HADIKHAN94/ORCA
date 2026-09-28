# ── ORCA Backend — cache.py ──────────────────────────────────────
"""
TTL Cache singleton. No Redis needed for Phase 1.
TTLs chosen to balance freshness vs. free API rate limits.
"""
from cachetools import TTLCache
import threading

_lock = threading.Lock()

# Ocean conditions: fresh every 1 hour (Open-Meteo updates hourly)
ocean_cache = TTLCache(maxsize=256, ttl=3600)

# PFZ zones: fresh every 6 hours (INCOIS updates 2x daily)
pfz_cache = TTLCache(maxsize=128, ttl=21600)

# Alerts: fresh every 15 minutes (IMD can issue rapidly during cyclones)
alerts_cache = TTLCache(maxsize=64, ttl=900)

# Safety scores: derived from ocean data, same TTL as ocean
safety_cache = TTLCache(maxsize=256, ttl=3600)

# Chlorophyll: daily satellite pass, cache 12 hours
chlorophyll_cache = TTLCache(maxsize=128, ttl=43200)

# SST from NOAA buoys: hourly, cache 1 hour
sst_cache = TTLCache(maxsize=128, ttl=3600)


def cache_key(lat: float, lon: float, *extras) -> str:
    """Round to 0.1° grid to maximise cache hits for nearby queries."""
    return f"{round(lat, 1)}_{round(lon, 1)}_{'_'.join(str(e) for e in extras)}"
