import logging
from fastapi import APIRouter

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint to verify the API is running."""
    return {"status": "ok", "service": "agentforge-backend"}
