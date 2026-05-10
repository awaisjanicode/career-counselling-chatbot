"""
api/scholarships.py — Scholarship search endpoint
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db, University

router = APIRouter(prefix="/scholarships", tags=["Scholarships"])

@router.get("")
def search_scholarships(
    q: Optional[str] = Query(None, description="Search keyword e.g. merit, need-based, HEC"),
    db: Session = Depends(get_db)
):
    """Search universities that offer scholarships matching the keyword."""
    query = db.query(University).filter(University.scholarships != None)
    if q:
        query = query.filter(University.scholarships.ilike(f"%{q}%"))

    unis = query.limit(20).all()
    return {
        "total": len(unis),
        "scholarships": [
            {
                "university": u.university_name,
                "location":   u.location,
                "scholarships": u.scholarships,
                "website":    u.website,
            }
            for u in unis if u.scholarships
        ]
    }
