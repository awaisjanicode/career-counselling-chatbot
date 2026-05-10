"""
models/chat.py — Request and response schemas for chat API
"""
from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"

class UniversityResult(BaseModel):
    id: int
    name: str
    location: str

class ChatResponse(BaseModel):
    reply: str
    universities: List[UniversityResult] = []
    session_id: str = "default"
