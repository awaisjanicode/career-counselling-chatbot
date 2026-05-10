"""
app/core/config.py — App settings loaded from .env file
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "AI Career Counseling Chatbot"
    DEBUG: bool = True
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/career_chatbot"
    GOOGLE_API_KEY: str = ""
    GOOGLE_API_BASE_URL: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
