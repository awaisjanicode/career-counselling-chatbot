"""
models/career.py — Schemas for career recommendations
"""
from pydantic import BaseModel
from typing import Optional, List

class RecommendRequest(BaseModel):
    field: str           # e.g. "Computer Science"
    location: str = ""   # e.g. "Peshawar"
    budget: str = ""     # e.g. "low" / "medium" / "high"

class UniversityCard(BaseModel):
    id: int
    name: str
    location: str
    programs: str
    scholarships: Optional[str]
    application_fee: Optional[str]
    website: Optional[str]

class RecommendResponse(BaseModel):
    recommendations: List[UniversityCard]
