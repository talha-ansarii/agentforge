"""AgentForge FastAPI Backend — Main Application Entry Point."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.config import ALLOWED_ORIGINS
from app.api.chat import router as chat_router
from app.db.connection import close_pool

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — handle startup and shutdown."""
    # Startup
    logger.info("🚀 AgentForge backend starting...")
    yield
    # Shutdown
    logger.info("🛑 Shutting down...")
    await close_pool()


app = FastAPI(
    title="AgentForge API",
    description="AI Agent Discovery Chatbot for Thinkly Labs",
    version="1.0.0",
    lifespan=lifespan,
)


# ── Global Exception Handlers ──


@app.exception_handler(ValidationError)
async def pydantic_validation_error_handler(_request: Request, exc: ValidationError):
    """Return a friendly 422 when Pydantic validation fails."""
    errors = exc.errors()
    messages = [e.get("msg", "Invalid input") for e in errors]
    return JSONResponse(
        status_code=422,
        content={
            "error": "; ".join(messages),
            "code": "VALIDATION_ERROR",
            "details": errors,
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(_request: Request, exc: Exception):
    """Catch-all for unhandled exceptions — never expose internal details."""
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "An unexpected error occurred. Please try again later.",
            "code": "INTERNAL_SERVER_ERROR",
        },
    )


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(chat_router, prefix="/api")
