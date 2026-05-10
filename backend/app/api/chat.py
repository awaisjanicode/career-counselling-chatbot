"""
api/chat.py — Chat endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.chat import ChatRequest, ChatResponse
from app.services.llm_service import llm_service

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    """Send a message and get an AI career counseling response."""
    reply, unis = llm_service.respond(req.message, db, req.session_id)
    return ChatResponse(
        reply=reply,
        universities=unis,
        session_id=req.session_id
    )
