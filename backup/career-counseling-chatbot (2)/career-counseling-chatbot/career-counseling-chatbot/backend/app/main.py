"""
app/main.py — FastAPI application entry point

HOW TO RUN:
    cd backend
    uvicorn app.main:app --reload

Then open: http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import create_tables
from app.api import chat, universities, careers, scholarships, cv_analyzer

app = FastAPI(
    title=settings.APP_NAME,
    description="AI Career Counseling Chatbot — FYP @ AWKUM",
    version="1.0.0",
)

# Allow React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(chat.router)
app.include_router(universities.router)
app.include_router(careers.router)
app.include_router(scholarships.router)
app.include_router(cv_analyzer.router)

@app.on_event("startup")
def startup():
    try:
        create_tables()
        print("Database tables checked/created.")
    except Exception as e:
        print(f"Warning: Could not connect to database on startup ({e}).")
    print(f"[SUCCESS] {settings.APP_NAME} is running!")
    print("API docs -> http://localhost:8000/docs")

@app.get("/")
def root():
    return {
        "project":  settings.APP_NAME,
        "status":   "running ✅",
        "docs":     "http://localhost:8000/docs",
        "endpoints": {
            "chat":          "/chat",
            "universities":  "/universities",
            "careers":       "/careers/recommend",
            "roadmap":       "/careers/roadmap/{field}",
            "scholarships":  "/scholarships",
        }
    }

@app.get("/health")
def health():
    return {"status": "ok"}
