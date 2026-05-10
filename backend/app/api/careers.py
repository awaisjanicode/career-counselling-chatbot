"""
api/careers.py — Career recommendation and roadmap endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db, University
from app.models.career import RecommendRequest, RecommendResponse
from app.services.roadmap_engine import get_roadmap
from app.utils.helpers import truncate

router = APIRouter(prefix="/careers", tags=["Careers"])

@router.post("/recommend", response_model=RecommendResponse)
def recommend(req: RecommendRequest, db: Session = Depends(get_db)):
    """Get university recommendations by field, location, and budget."""
    query = req.field
    if req.location:
        query += f" {req.location}"

    words = [w for w in query.lower().split() if len(w) > 2]
    seen, results = set(), []
    for word in words[:4]:
        p = f"%{word}%"
        found = db.query(University).filter(
            or_(
                University.undergraduate_programs.ilike(p),
                University.location.ilike(p),
                University.university_name.ilike(p),
            )
        ).limit(5).all()
        for u in found:
            if u.id not in seen:
                seen.add(u.id)
                results.append(u)

    return RecommendResponse(
        recommendations=[
            {
                "id":              u.id,
                "name":            u.university_name,
                "location":        u.location,
                "programs":        truncate(u.undergraduate_programs, 300),
                "scholarships":    u.scholarships,
                "application_fee": u.application_fee,
                "website":         u.website,
            }
            for u in results[:10]
        ]
    )

@router.get("/roadmap/{field}")
def roadmap(field: str):
    """Get a career roadmap for a given field of study."""
    return get_roadmap(field)
