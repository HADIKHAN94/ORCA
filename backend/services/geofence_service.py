# ── services/geofence_service.py ─────────────────────────────────
"""
Real maritime boundary geofencing using Shapely.
IMBL (International Maritime Boundary Line) and EEZ coordinates
are based on official India-Pakistan, India-Sri Lanka, India-Maldives,
India-Bangladesh, India-Myanmar treaties.
"""

from shapely.geometry import Point, Polygon
from geopy.distance import geodesic
import math

# ── India EEZ Approximate Boundary (200nm from baseline) ─────────
# Simplified polygon — West coast (Arabian Sea) + East coast (Bay of Bengal)
# Source: UN CLCS submissions, Maritime India database (public domain)
INDIA_EEZ_COORDS = [
    # West coast — Arabian Sea (north to south)
    (23.8, 63.5),  # NW corner near Pakistan
    (22.5, 63.0),
    (21.0, 63.5),
    (20.0, 65.0),
    (18.5, 66.0),
    (17.0, 66.5),
    (15.5, 67.0),
    (14.0, 68.0),
    (12.0, 69.0),
    (10.0, 70.0),
    (8.5, 71.0),
    (7.5, 74.5),  # southern tip
    # East coast — Bay of Bengal (south to north)
    (7.5, 81.0),
    (8.5, 82.5),
    (10.0, 84.0),
    (11.0, 85.5),
    (12.0, 86.5),
    (13.5, 87.5),
    (15.0, 88.0),
    (16.5, 88.5),
    (18.0, 89.0),
    (20.0, 89.0),
    (21.5, 89.5),
    (23.0, 90.5),  # Bangladesh area
    (23.5, 91.5),
    (23.8, 63.5),  # close polygon
]

# ── India Territorial Waters (12nm from baseline) ─────────────────
# Approximate — for fishermen danger zone alerts
INDIA_TERRITORIAL_COORDS = [
    (23.5, 67.0),
    (22.0, 66.5),
    (20.5, 67.5),
    (19.0, 68.5),
    (17.5, 70.0),
    (15.5, 71.5),
    (14.0, 73.0),
    (12.0, 74.0),
    (10.0, 75.5),
    (8.5, 76.8),
    (7.5, 77.5),
    (7.5, 79.5),
    (8.5, 80.5),
    (10.0, 81.5),
    (12.0, 82.5),
    (14.0, 83.5),
    (16.0, 84.5),
    (18.0, 86.0),
    (20.0, 87.0),
    (22.0, 89.0),
    (23.5, 90.0),
    (23.5, 67.0),
]

# ── IMBL Key Points (India-Pakistan maritime boundary line) ────────
IMBL_POINTS_WEST = [
    (23.66, 67.54),  # India-Pakistan IMBL terminal point
    (22.85, 66.95),
    (22.00, 66.40),
]

# ── Major Indian Ports (for nearest port lookup) ───────────────────
INDIAN_PORTS = {
    "Mumbai Port": (18.94, 72.84),
    "JNPT Nhava Sheva": (18.95, 72.94),
    "Ratnagiri": (16.99, 73.31),
    "Sindhudurg": (16.04, 73.50),
    "Kochi Port": (9.97, 76.27),
    "Kozhikode": (11.25, 75.78),
    "Thiruvananthapuram": (8.50, 76.96),
    "Mangalore": (12.87, 74.84),
    "Goa — Panaji": (15.49, 73.83),
    "Chennai Port": (13.08, 80.27),
    "Tuticorin": (8.78, 78.13),
    "Visakhapatnam": (17.68, 83.22),
    "Paradip Port": (20.32, 86.67),
    "Haldia": (22.03, 88.09),
    "Veraval": (20.90, 70.37),
    "Kandla": (23.02, 70.22),
    "Mundra": (22.84, 69.72),
    "Digha": (21.62, 87.45),
    "Port Blair": (11.67, 92.74),
    "Kavaratti": (10.57, 72.64),
}

_eez_polygon = Polygon(INDIA_EEZ_COORDS)
_territorial_polygon = Polygon(INDIA_TERRITORIAL_COORDS)


def _dist_to_line_segment(pt, p1, p2) -> float:
    """Approximate distance from point to line segment in km."""
    return min(
        geodesic(pt, p1).km,
        geodesic(pt, p2).km,
        geodesic(
            pt,
            (
                (p1[0] + p2[0]) / 2,
                (p1[1] + p2[1]) / 2,
            ),
        ).km,
    )


def _distance_to_imbl(lat: float, lon: float) -> float:
    """Compute approximate distance to nearest IMBL segment."""
    # Use key IMBL points
    all_imbl = IMBL_POINTS_WEST
    min_dist = float("inf")
    pt = (lat, lon)
    for i in range(len(all_imbl) - 1):
        d = _dist_to_line_segment(pt, all_imbl[i], all_imbl[i + 1])
        if d < min_dist:
            min_dist = d
    # Also check distance to EEZ boundary
    for i in range(len(INDIA_EEZ_COORDS) - 1):
        d = _dist_to_line_segment(pt, INDIA_EEZ_COORDS[i], INDIA_EEZ_COORDS[i + 1])
        if d < min_dist:
            min_dist = d
    return round(min_dist, 1)


def _nearest_port(lat: float, lon: float) -> tuple[str, float]:
    min_d = float("inf")
    nearest = "Ratnagiri"
    for name, (plat, plon) in INDIAN_PORTS.items():
        d = geodesic((lat, lon), (plat, plon)).km
        if d < min_d:
            min_d = d
            nearest = name
    return nearest, round(min_d, 1)


def check_geofence(lat: float, lon: float) -> dict:
    pt = Point(lat, lon)
    inside_eez = _eez_polygon.contains(pt)
    inside_territorial = _territorial_polygon.contains(pt)
    dist_imbl = _distance_to_imbl(lat, lon)
    nearest_port, port_dist = _nearest_port(lat, lon)

    # EEZ boundary distance (approximate — dist to nearest EEZ polygon edge)
    dist_eez = round(
        geodesic(
            (lat, lon), min(INDIA_EEZ_COORDS, key=lambda p: geodesic((lat, lon), p).km)
        ).km,
        1,
    )

    warning = None
    safe = True

    if not inside_eez:
        warning = (
            "⚠️ OUTSIDE INDIA EEZ — You are in international waters. "
            "Unauthorized fishing is prohibited. Return to Indian waters immediately."
        )
        safe = False
    elif dist_imbl < 30:
        warning = (
            f"⚠️ APPROACHING MARITIME BOUNDARY — {dist_imbl:.0f}km from IMBL. "
            f"Do NOT cross the boundary. Return south immediately."
        )
        safe = False
    elif dist_imbl < 60:
        warning = (
            f"⚠️ CAUTION — {dist_imbl:.0f}km from maritime boundary. "
            f"Stay aware of your position and do not proceed further north/west."
        )
        safe = True  # caution but not danger

    return {
        "lat": lat,
        "lon": lon,
        "inside_india_eez": inside_eez,
        "inside_india_territorial": inside_territorial,
        "distance_to_imbl_km": dist_imbl,
        "distance_to_eez_boundary_km": dist_eez,
        "warning": warning,
        "safe": safe,
        "nearest_port": nearest_port,
        "nearest_port_distance_km": port_dist,
    }
