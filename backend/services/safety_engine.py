# ── services/safety_engine.py ────────────────────────────────────
"""
Safety score computation engine.
Aggregates ocean + weather data into a 0-100 vessel safety score.
Different vessel types have different thresholds.
"""

VESSEL_THRESHOLDS = {
    "small": {"wave": 1.5, "wind": 20, "swell": 8, "label": "Small Boat (<20ft)"},
    "country": {
        "wave": 2.0,
        "wind": 25,
        "swell": 10,
        "label": "Country Boat (20-35ft)",
    },
    "mechanized": {
        "wave": 2.5,
        "wind": 30,
        "swell": 12,
        "label": "Mechanized Trawler (35-60ft)",
    },
    "large": {"wave": 4.0, "wind": 50, "swell": 16, "label": "Large Vessel (>60ft)"},
}


def compute_safety_score(ocean: dict, vessel_type: str = "mechanized") -> dict:
    thresholds = VESSEL_THRESHOLDS.get(vessel_type, VESSEL_THRESHOLDS["mechanized"])

    wave = ocean.get("wave_height", 1.0)
    wind = ocean.get("wind_speed", 12.0)
    swell = ocean.get("wave_period", 8.0)
    vis = ocean.get("visibility", "Good")
    sst = ocean.get("sst", 28.0)

    # Score each parameter (100 = completely safe, 0 = extremely dangerous)
    def param_score(val, threshold, invert=False):
        ratio = val / threshold
        if invert:
            ratio = 1 - ratio
        score = max(0, min(100, (1 - min(ratio, 1)) * 100))
        return round(score)

    def status(val, threshold):
        ratio = val / threshold
        if ratio < 0.6:
            return "SAFE"
        if ratio < 0.85:
            return "CAUTION"
        return "DANGER"

    wave_score = param_score(wave, thresholds["wave"])
    wind_score = param_score(wind, thresholds["wind"])
    swell_score = param_score(swell, thresholds["swell"], invert=True)

    vis_score = {
        "Excellent": 100,
        "Good": 85,
        "Moderate": 55,
        "Poor": 20,
        "Unknown": 60,
    }.get(vis, 60)

    # SST comfort (25-31°C is optimal for fishermen; <22 or >33 are extreme)
    sst_score = 100 if 25 <= sst <= 31 else 70 if 22 <= sst <= 33 else 40

    # Weighted composite
    total = round(
        wave_score * 0.35
        + wind_score * 0.30
        + swell_score * 0.15
        + vis_score * 0.15
        + sst_score * 0.05
    )

    label = "SAFE" if total >= 70 else "MODERATE" if total >= 40 else "DANGER"

    recommendations = {
        "SAFE": "Conditions are favourable. Safe for all vessel types. Standard sea-going precautions apply.",
        "MODERATE": f"Exercise caution. Conditions are moderate. Recommended for vessels above 25ft. Check again before departure.",
        "DANGER": "Do NOT venture into the sea. Return to port immediately. Dangerous conditions for all vessel types.",
    }

    # Compute 24h safety forecast from ocean forecast data
    forecast_24h = []
    for fh in ocean.get("forecast_24h", [])[:24]:
        f_score = compute_hourly_score(fh, thresholds)
        forecast_24h.append(
            {
                "hour": fh["hour"],
                "score": f_score,
                "wave_height": fh.get("wave_height", wave),
            }
        )

    return {
        "score": total,
        "label": label,
        "vessel_type": thresholds["label"],
        "recommendation": recommendations[label],
        "conditions": {
            "wave_height": {
                "value": wave,
                "unit": "m",
                "threshold": thresholds["wave"],
                "status": status(wave, thresholds["wave"]),
            },
            "wind_speed": {
                "value": wind,
                "unit": "km/h",
                "threshold": thresholds["wind"],
                "status": status(wind, thresholds["wind"]),
            },
            "swell_period": {
                "value": swell,
                "unit": "sec",
                "threshold": thresholds["swell"],
                "status": "SAFE" if swell < thresholds["swell"] else "CAUTION",
            },
            "visibility": {
                "value": vis,
                "unit": "",
                "threshold": "Good min",
                "status": "SAFE" if vis_score > 70 else "CAUTION",
            },
            "sea_state": {
                "value": f"SST {sst}°C",
                "unit": "",
                "threshold": "25-31°C",
                "status": "SAFE" if sst_score > 70 else "CAUTION",
            },
            "weather": {
                "value": "Live data",
                "unit": "",
                "threshold": "No storm",
                "status": "SAFE",
            },
        },
        "forecast_24h": forecast_24h,
    }


def compute_hourly_score(fh: dict, thresholds: dict) -> int:
    wave = fh.get("wave_height", 1.0)
    wind = fh.get("wind_speed", 12.0)
    wave_s = max(0, min(100, (1 - min(wave / thresholds["wave"], 1)) * 100))
    wind_s = max(0, min(100, (1 - min(wind / thresholds["wind"], 1)) * 100))
    return round(wave_s * 0.55 + wind_s * 0.45)
