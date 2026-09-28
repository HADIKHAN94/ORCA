from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import db
import math

router = APIRouter(prefix="/api/sos", tags=["sos"])


class SOSRequest(BaseModel):
    lat: float
    lon: float
    user_id: int = None
    vessel_id: str = None


COAST_GUARDS = [
    {"name": "Coast Guard Station Ratnagiri", "lat": 16.99, "lon": 73.31},
    {"name": "Coast Guard Station Mumbai", "lat": 18.93, "lon": 72.83},
    {"name": "Coast Guard Station Kochi", "lat": 9.93, "lon": 76.27},
    {"name": "Coast Guard Station Chennai", "lat": 13.08, "lon": 80.27},
    {"name": "Coast Guard Station Visakhapatnam", "lat": 17.68, "lon": 83.22},
]


def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


@router.post("")
def trigger_sos(req: SOSRequest, session: Session = Depends(db.get_db)):
    # Log SOS to DB
    new_sos = db.SOSLog(user_id=req.user_id, lat=req.lat, lon=req.lon, status="ACTIVE")
    session.add(new_sos)
    session.commit()

    # Find nearest coast guard
    nearest = None
    min_dist = float("inf")
    for cg in COAST_GUARDS:
        dist = haversine(req.lat, req.lon, cg["lat"], cg["lon"])
        if dist < min_dist:
            min_dist = dist
            nearest = cg

    return {
        "status": "SOS Broadcasted",
        "log_id": new_sos.id,
        "nearest_station": nearest["name"],
        "distance_km": round(min_dist, 1),
        "message": f"Help has been dispatched from {nearest['name']} ({round(min_dist, 1)}km away).",
    }
