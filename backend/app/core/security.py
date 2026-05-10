"""
core/security.py — Basic security helpers (extend later with JWT auth)
"""
from fastapi import Header, HTTPException
from typing import Optional

async def verify_token(x_token: Optional[str] = Header(None)):
    """Placeholder auth — extend with real JWT later."""
    pass  # No auth required for now
