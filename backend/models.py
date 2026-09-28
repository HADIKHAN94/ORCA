# ── ORCA Backend — models.py ─────────────────────────────────────
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


# ── Ocean ──────────────────────────────────────────────────────
class OceanConditions(BaseModel):
    lat: float
    lon: float
    sst: float = Field(..., description="Sea Surface Temperature °C")
    wave_height: float = Field(..., description="Significant wave height m")
    wave_direction: float = Field(..., description="Wave direction degrees")
    wave_period: float = Field(..., description="Wave period seconds")
    swell_height: float
    swell_direction: float
    wind_speed: float = Field(..., description="Wind speed km/h")
    wind_direction: float
    wind_direction_label: str
    current_velocity: float = Field(..., description="Ocean current m/s")
    current_direction: float
    visibility: str
    timestamp: str
    source: str


class ForecastHour(BaseModel):
    hour: str
    wave_height: float
    wind_speed: float
    sst: float


class OceanForecast(BaseModel):
    lat: float
    lon: float
    hourly: List[ForecastHour]
    source: str


# ── Safety ─────────────────────────────────────────────────────
class ConditionDetail(BaseModel):
    value: float | str
    unit: str
    threshold: float | str
    status: Literal["SAFE", "CAUTION", "DANGER"]


class SafetyScore(BaseModel):
    lat: float
    lon: float
    vessel_type: str
    score: int = Field(..., ge=0, le=100)
    label: Literal["SAFE", "MODERATE", "DANGER"]
    recommendation: str
    conditions: dict
    forecast_24h: List[dict]
    distance_to_imbl_km: float
    source: str


# ── Fishing ────────────────────────────────────────────────────
class PFZZone(BaseModel):
    id: str
    lat: float
    lon: float
    distance_km: float
    bearing_deg: float
    bearing_label: str
    intensity: Literal["HIGH", "MEDIUM", "LOW"]
    chlorophyll: float
    sst: float
    species: List[str]
    depth_range: str
    valid_until: str
    source: str


class PFZResponse(BaseModel):
    query_lat: float
    query_lon: float
    zones: List[PFZZone]
    monsoon_ban: bool
    advisory_date: str
    total_zones: int


class FishingOutlook(BaseModel):
    date: str
    day: str
    score: int
    weather: str
    wave_height: float
    wind_speed: float
    recommendation: str


# ── Alerts ─────────────────────────────────────────────────────
class Alert(BaseModel):
    id: str
    severity: Literal["CRITICAL", "WARNING", "ADVISORY", "INFO"]
    category: str
    title: str
    description: str
    region: str
    issued: str
    expires: str
    source: str
    lat: Optional[float] = None
    lon: Optional[float] = None


class CycloneInfo(BaseModel):
    name: str
    category: int
    lat: float
    lon: float
    max_wind_kmh: float
    central_pressure_hpa: float
    forward_speed_kmh: float
    heading_deg: float
    landfall_hours: Optional[int]
    affected_states: List[str]
    source: str


class AlertsResponse(BaseModel):
    alerts: List[Alert]
    cyclone: Optional[CycloneInfo] = None
    last_updated: str


# ── Geofence ───────────────────────────────────────────────────
class GeofenceRequest(BaseModel):
    lat: float
    lon: float
    vessel_id: Optional[str] = "unknown"


class GeofenceResponse(BaseModel):
    lat: float
    lon: float
    inside_india_eez: bool
    inside_india_territorial: bool
    distance_to_imbl_km: float
    distance_to_eez_boundary_km: float
    warning: Optional[str] = None
    safe: bool
    nearest_port: Optional[str] = None
    nearest_port_distance_km: Optional[float] = None
