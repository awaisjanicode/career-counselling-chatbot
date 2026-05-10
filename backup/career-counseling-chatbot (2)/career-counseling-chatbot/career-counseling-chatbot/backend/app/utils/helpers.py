"""
utils/helpers.py — Shared utility functions
"""

def truncate(text: str, max_len: int = 200) -> str:
    if not text:
        return ""
    return text[:max_len] + "..." if len(text) > max_len else text

def clean_text(text: str) -> str:
    if not text:
        return ""
    return " ".join(text.split())
