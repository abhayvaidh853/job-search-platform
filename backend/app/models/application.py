from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ApplicationCreate(BaseModel):
    job_id: str
    cover_letter: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    user_id: str
    cover_letter: Optional[str] = None
    status: str
    applied_at: datetime