"""
database.py — PostgreSQL connection and University table model
"""
from sqlalchemy import create_engine, Column, Integer, String, Text, JSON
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class University(Base):
    __tablename__ = "universities"

    id                     = Column(Integer, primary_key=True, index=True)
    university_name        = Column(String(300), nullable=False, index=True)
    website                = Column(String(300))
    undergraduate_programs = Column(Text)
    master_programs        = Column(Text)
    admission_criteria     = Column(Text)
    application_process    = Column(Text)
    scholarships           = Column(Text)
    entry_test             = Column(Text)
    application_fee        = Column(String(200))
    detailed_fee_structure = Column(JSON)
    location               = Column(Text)
    contact_details        = Column(Text)

    def to_text(self) -> str:
        """Plain text summary — used for FAISS embeddings."""
        return (
            f"University: {self.university_name}\n"
            f"Location: {self.location}\n"
            f"Undergraduate: {self.undergraduate_programs}\n"
            f"Masters: {self.master_programs}\n"
            f"Admission: {self.admission_criteria}\n"
            f"Scholarships: {self.scholarships}\n"
            f"Entry test: {self.entry_test}\n"
            f"Fee: {self.application_fee}\n"
            f"Contact: {self.contact_details}"
        )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)
    print("Tables created.")
