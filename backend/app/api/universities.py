"""
api/universities.py — University search and detail endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from app.database import get_db, University
from app.utils.helpers import truncate

router = APIRouter(prefix="/universities", tags=["Universities"])

@router.get("")
def list_universities(
    q: Optional[str] = Query(None, description="Search keyword"),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query_clean = q.strip().lower() if q else ""
    db_query = db.query(University)

    if query_clean:
        # Priority 1: Name match
        name_results = db_query.filter(University.university_name.ilike(f"%{query_clean}%")).all()
        if name_results:
            unis = name_results[skip : skip + limit]
            return {
                "total": len(name_results), 
                "universities": [
                    {
                        "id":           u.id,
                        "name":         u.university_name,
                        "location":     u.location,
                        "website":      u.website,
                        "programs":     truncate(u.undergraduate_programs, 200),
                        "scholarships": truncate(u.scholarships, 100),
                        "fee":          u.application_fee,
                    } for u in unis
                ]
            }

        # Priority 2: Location or Program match
        db_query = db_query.filter(
            or_(
                University.location.ilike(f"%{query_clean}%"),
                University.undergraduate_programs.ilike(f"%{query_clean}%")
            )
        )

    total = db_query.count()
    unis  = db_query.offset(skip).limit(limit).all()
    return {
        "total": total,
        "universities": [
            {
                "id":           u.id,
                "name":         u.university_name,
                "location":     u.location,
                "website":      u.website,
                "programs":     truncate(u.undergraduate_programs, 200),
                "scholarships": truncate(u.scholarships, 100),
                "fee":          u.application_fee,
            }
            for u in unis
        ]
    }

@router.get("/{uid}")
def get_university(uid: int, db: Session = Depends(get_db)):
    uni = db.query(University).filter(University.id == uid).first()
    if not uni:
        raise HTTPException(404, "University not found")
    return {
        "id":                     uni.id,
        "name":                   uni.university_name,
        "website":                uni.website,
        "location":               uni.location,
        "undergraduate_programs": uni.undergraduate_programs,
        "master_programs":        uni.master_programs,
        "admission_criteria":     uni.admission_criteria,
        "application_process":    uni.application_process,
        "scholarships":           uni.scholarships,
        "entry_test":             uni.entry_test,
        "application_fee":        uni.application_fee,
        "detailed_fee_structure": uni.detailed_fee_structure,
        "contact_details":        uni.contact_details,
    }
