# ── ORCA Backend — main.py ───────────────────────────────────────
"""
FastAPI entry point for ORCA Marine Intelligence Platform.
Run: uvicorn main:app --reload --port 8000
"""
import asyncio
from fastapi import FastAPI
from db import Base, engine

Base.metadata.create_all(bind=engine)
from fastapi.middleware.cors import CORSMiddleware

from routers import ocean, fishing, safety, alerts, geofence, auth, chat, sos

app = FastAPI(
    title="ORCA — Marine Intelligence API",
    description="Real-time ocean data, fishing zones, safety scores, alerts, and geofencing for Indian waters.",
    version="1.0.0",
)

# ── CORS (allow frontend at :5173 and any localhost) ──────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",  # remove in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ─────────────────────────────────────────────
app.include_router(ocean.router)
app.include_router(fishing.router)
app.include_router(safety.router)
app.include_router(alerts.router)
app.include_router(geofence.router)
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(sos.router)


@app.get("/")
async def root():
    return {
        "name": "ORCA Marine Intelligence API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "ocean": "/api/ocean?lat=16.99&lon=73.31",
            "fishing_pfz": "/api/fishing/pfz?lat=16.99&lon=73.31",
            "fishing_outlook": "/api/fishing/outlook?lat=16.99&lon=73.31",
            "safety": "/api/safety?lat=16.99&lon=73.31&vessel_type=mechanized",
            "alerts": "/api/alerts?lat=16.99&lon=73.31",
            "geofence": "/api/geofence/check?lat=16.99&lon=73.31",
            "docs": "/docs",
        },
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


