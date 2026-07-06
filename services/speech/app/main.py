"""Speech Service - Speech recognition and synthesis."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.routers import speech


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    print("Starting Speech Service...")
    yield
    print("Shutting down Speech Service...")


app = FastAPI(
    title="EmirSign AI - Speech Service",
    description="Speech recognition and synthesis service",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(speech.router, prefix="/api/v1/speech", tags=["Speech"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "emirsign-speech",
        "version": "0.1.0",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
    )
