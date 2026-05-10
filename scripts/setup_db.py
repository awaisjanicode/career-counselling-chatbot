"""
scripts/setup_db.py — Create tables and load 280 universities into PostgreSQL

HOW TO RUN (from backend/ folder):
    python ../scripts/setup_db.py

Make sure .env is configured with your DATABASE_URL first.
"""
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.database import create_tables, SessionLocal, University

DATA_FILE = Path(__file__).parent.parent / "data" / "universities.json"


def setup():
    print("=" * 50)
    print("  Setting up database...")
    print("=" * 50)

    # 1. Create tables
    create_tables()
    print("DONE: Tables created.")

    # 2. Load JSON
    if not DATA_FILE.exists():
        print(f"ERROR: Data file not found: {DATA_FILE}")
        return

    with open(DATA_FILE, encoding="utf-8") as f:
        data = json.load(f)
    print(f"FILE: Found {len(data)} universities in JSON.")

    # 3. Insert into DB
    db = SessionLocal()
    inserted = skipped = 0

    for item in data:
        name = item.get("university_name", "").strip()
        if not name:
            continue
        if db.query(University).filter_by(university_name=name).first():
            skipped += 1
            continue
        uni = University(
            university_name        = name,
            website                = item.get("website", ""),
            undergraduate_programs = item.get("undergraduate_programs", ""),
            master_programs        = item.get("master_programs", ""),
            admission_criteria     = item.get("admission_criteria", ""),
            application_process    = item.get("application_process", ""),
            scholarships           = item.get("scholarships", ""),
            entry_test             = item.get("entry_test", ""),
            application_fee        = str(item.get("application_fee", ""))[:200],
            detailed_fee_structure = item.get("detailed_fee_structure", {}),
            location               = item.get("location", ""),
            contact_details        = item.get("contact_details", ""),
        )
        db.add(uni)
        inserted += 1

    db.commit()
    db.close()
    print(f"DONE: Inserted: {inserted}  |  Skipped: {skipped}")
    print(f"SUCCESS: Database ready with {inserted + skipped} universities!")
    print("\nNow run the API:")
    print("  cd backend")
    print("  uvicorn app.main:app --reload")


if __name__ == "__main__":
    setup()
