import httpx, json, sys

BASE = "http://127.0.0.1:8000"
OK = []
FAIL = []

tests = [
    ("Health",          f"{BASE}/health",                                    {}),
    ("Ocean — Ratnagiri", f"{BASE}/api/ocean",                             {"lat":16.99,"lon":73.31}),
    ("Safety — Ratnagiri", f"{BASE}/api/safety",                           {"lat":16.99,"lon":73.31,"vessel_type":"mechanized"}),
    ("PFZ — Ratnagiri",  f"{BASE}/api/fishing/pfz",                        {"lat":16.99,"lon":73.31}),
    ("Alerts — Ratnagiri", f"{BASE}/api/alerts",                           {"lat":16.99,"lon":73.31}),
    ("Geofence — Ratnagiri", f"{BASE}/api/geofence/check",                 {"lat":16.99,"lon":73.31}),
    ("Outlook — Kochi",  f"{BASE}/api/fishing/outlook",                    {"lat":9.93,"lon":76.27}),
    ("Ocean — Chennai",  f"{BASE}/api/ocean",                              {"lat":13.08,"lon":80.27}),
    ("Safety — Veraval", f"{BASE}/api/safety",                             {"lat":20.90,"lon":70.37,"vessel_type":"small"}),
]

for name, url, params in tests:
    try:
        r = httpx.get(url, params=params, timeout=20)
        if r.status_code == 200:
            d = r.json()
            summary = ""
            if "sst" in d:         summary = f"SST={d['sst']}°C wave={d['wave_height']}m wind={d['wind_speed']}km/h"
            elif "score" in d:     summary = f"Score={d['score']} {d['label']}"
            elif "total_zones" in d: summary = f"Zones={d['total_zones']} ban={d['monsoon_ban']}"
            elif "alerts" in d:    summary = f"Alerts={len(d['alerts'])}"
            elif "safe" in d:      summary = f"EEZ={d['inside_india_eez']} IMBL={d['distance_to_imbl_km']}km"
            elif "outlook" in d:   summary = f"Days={len(d['outlook'])}"
            elif "status" in d:    summary = d['status']
            print(f"  PASS  {name}: {summary}")
            OK.append(name)
        else:
            print(f"  FAIL  {name}: HTTP {r.status_code} — {r.text[:100]}")
            FAIL.append(name)
    except Exception as e:
        print(f"  ERROR {name}: {e}")
        FAIL.append(name)

print(f"\nResults: {len(OK)} passed / {len(FAIL)} failed")
if FAIL:
    print("Failed:", FAIL)
    sys.exit(1)
