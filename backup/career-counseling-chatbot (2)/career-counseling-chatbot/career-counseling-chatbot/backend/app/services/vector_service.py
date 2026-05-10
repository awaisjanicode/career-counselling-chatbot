"""
services/vector_service.py — FAISS semantic search
Run scripts/ingest_data.py first to build the index.
"""
import pickle
from pathlib import Path

INDEX_DIR = Path(__file__).parent.parent.parent / "vector_store"
INDEX_FILE = INDEX_DIR / "university.index"
META_FILE  = INDEX_DIR / "university_meta.pkl"


class VectorService:
    def __init__(self):
        self._index = None
        self._meta  = None
        self._model = None

    def _load(self):
        if self._index is not None:
            return True
        if not INDEX_FILE.exists():
            return False
        import faiss
        self._index = faiss.read_index(str(INDEX_FILE))
        with open(META_FILE, "rb") as f:
            self._meta = pickle.load(f)
        return True

    def _get_model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer("all-MiniLM-L6-v2")
        return self._model

    def search(self, query: str, top_k: int = 5) -> list:
        """Semantic search — returns list of university metadata dicts."""
        if not self._load():
            return []
        import numpy as np
        model = self._get_model()
        vec = model.encode([query]).astype("float32")
        distances, indices = self._index.search(vec, top_k)
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if 0 <= idx < len(self._meta):
                r = self._meta[idx].copy()
                r["score"] = float(dist)
                results.append(r)
        return results

    def is_ready(self) -> bool:
        return INDEX_FILE.exists()


vector_service = VectorService()
