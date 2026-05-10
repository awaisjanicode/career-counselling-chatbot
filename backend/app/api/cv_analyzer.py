from typing import List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.cv_analyzer_service import cv_analyzer_service

router = APIRouter(prefix="/cv-analyzer", tags=["CV Analyzer"])

@router.post("/analyze")
async def analyze_cv_endpoint(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Upload a CV (PDF) or an Image (Scholarship, etc.) to get an AI analysis.
    """
    filename = file.filename.lower()
    is_image = any(filename.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"])
    is_pdf = filename.endswith(".pdf")

    if not is_image and not is_pdf:
        raise HTTPException(status_code=400, detail="Only PDF and Image files (.jpg, .png, .webp) are supported.")

    try:
        file_bytes = await file.read()
        
        if is_image:
            # Handle Image with Vision
            analysis = await cv_analyzer_service.analyze_visual(file_bytes, job_description)
            return analysis
        else:
            # Handle PDF with Text Extraction
            resume_text = cv_analyzer_service.extract_text_from_pdf(file_bytes)
            if not resume_text:
                raise HTTPException(status_code=400, detail="Could not extract text from PDF.")
            analysis = await cv_analyzer_service.analyze_cv(resume_text, job_description)
            return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cover-letter")
async def generate_cover_letter_endpoint(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Generate a tailored cover letter.
    """
    try:
        pdf_bytes = await file.read()
        resume_text = cv_analyzer_service.extract_text_from_pdf(pdf_bytes)
        result = await cv_analyzer_service.generate_cover_letter(resume_text, job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/interview-prep")
async def interview_prep_endpoint(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Generate interview questions based on CV and JD.
    """
    try:
        pdf_bytes = await file.read()
        resume_text = cv_analyzer_service.extract_text_from_pdf(pdf_bytes)
        result = await cv_analyzer_service.generate_interview_prep(resume_text, job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate-answer")
async def evaluate_answer_endpoint(
    question: str = Form(...),
    sample_answer: str = Form(...),
    user_answer: str = Form(...),
    resume_text: str = Form(...),
    job_description: str = Form(...)
):
    """
    Evaluate an interview answer.
    """
    try:
        result = await cv_analyzer_service.evaluate_interview_answer(
            question, sample_answer, user_answer, resume_text, job_description
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bulk-analyze")
async def bulk_analyze_endpoint(
    files: List[UploadFile] = File(...),
    job_description: str = Form(...)
):
    """
    Analyze multiple CVs against one JD.
    """
    results = []
    for file in files:
        try:
            pdf_bytes = await file.read()
            resume_text = cv_analyzer_service.extract_text_from_pdf(pdf_bytes)
            analysis = await cv_analyzer_service.analyze_cv(resume_text, job_description)
            results.append({
                "filename": file.filename,
                "analysis": analysis
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e)
            })
    return results
