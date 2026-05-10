"""
scripts/ingest_data.py — Generate FAISS embeddings for semantic search

HOW TO RUN (from project root):
    python scripts/ingest_data.py

This takes ~2-3 minutes. Run once after setup_db.py.
The index is saved to backend/vector_store/
"""
import sys
import pickle
import numpy as np
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.database import SessionLocal, University

INDEX_DIR  = Path(__file__).parent.parent / "backend" / "vector_store"
INDEX_FILE = INDEX_DIR / "university.index"
META_FILE  = INDEX_DIR / "university_meta.pkl"
MODEL_NAME = "all-MiniLM-L6-v2"


def build_index():
    print("=" * 50)
    print("  Building FAISS vector index...")
    print("=" * 50)

    INDEX_DIR.mkdir(parents=True, exist_ok=True)

    # Load model
    print(f"Loading model: {MODEL_NAME}")
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer(MODEL_NAME)

    texts = []
    meta = []

    # 1. Load universities from DB
    db = None
    try:
        db = SessionLocal()
        unis = db.query(University).all()
        print(f"Vectorizing {len(unis)} universities...")
        for u in unis:
            texts.append(u.to_text())
            meta.append({"type": "university", "id": u.id, "name": u.university_name, "location": u.location})
    except Exception as e:
        print(f"Warning: Could not connect to database ({e}). Skipping universities...")
    finally:
        if db:
            db.close()

    # 2. Load scholarships from JSON
    import json
    scholarships_path = Path(__file__).parent.parent / "data" / "scholarships.json"
    if scholarships_path.exists():
        with open(scholarships_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            scholarships = data.get("scholarships", [])
            print(f"Vectorizing {len(scholarships)} scholarships...")
            for s in scholarships:
                eligibility = s.get('eligibility', {})
                if isinstance(eligibility, dict):
                    elig_str = f"{eligibility.get('nationality', 'N/A')}. Req: {eligibility.get('academic_requirement', 'N/A')}"
                else:
                    elig_str = str(eligibility)
                
                fields = ", ".join(s.get('fields_of_study', [])) if isinstance(s.get('fields_of_study'), list) else str(s.get('fields_of_study'))
                
                text = (
                    f"Scholarship: {s.get('name')}\n"
                    f"Type: {s.get('type')}\n"
                    f"Amount: {s.get('funding_amount')}\n"
                    f"Eligibility: {elig_str}\n"
                    f"Fields: {fields}"
                )
                texts.append(text)
                meta.append({"type": "scholarship", "name": s.get("name"), "provider": s.get("type")})

    # 3. Load career paths from JSON
    career_paths_path = Path(__file__).parent.parent / "data" / "career_paths.json"
    if career_paths_path.exists():
        with open(career_paths_path, "r", encoding="utf-8") as f:
            career_paths = json.load(f)
            print(f"Vectorizing {len(career_paths)} career paths...")
            for cp in career_paths:
                text = (
                    f"Career Path: {cp.get('field', 'Unknown')}\n"
                    f"Degree: {cp.get('degree', '')}\n"
                    f"Duration: {cp.get('duration', '')}\n"
                    f"Skills: {', '.join(cp.get('skills', []))}\n"
                    f"Careers: {', '.join(cp.get('careers', []))}"
                )
                texts.append(text)
                meta.append({"type": "career_path", "title": cp.get('field', 'Unknown')})

    if not texts:
        print("No data found to index!")
        return

    # Generate embeddings
    embeddings = model.encode(texts, show_progress_bar=True, batch_size=32)
    embeddings = np.array(embeddings).astype("float32")

    # Build and save FAISS index
    import faiss
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)
    faiss.write_index(index, str(INDEX_FILE))

    with open(META_FILE, "wb") as f:
        pickle.dump(meta, f)

    print(f"Index saved -> {INDEX_FILE}")
    print(f"Metadata   -> {META_FILE}")
    print(f"{index.ntotal} items indexed from all sources!")

    # Quick test
    print("\nTesting search: 'computer science Peshawar'")
    vec = model.encode(["computer science Peshawar"]).astype("float32")
    distances, indices = index.search(vec, 3)
    for dist, idx in zip(distances[0], indices[0]):
        item = meta[idx]
        name = item.get("name") or item.get("title") or "Unnamed"
        loc  = item.get("location", "N/A")
        print(f"   -> {name} | {loc} (Type: {item.get('type')})")


if __name__ == "__main__":
    build_index()
