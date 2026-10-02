from datetime import datetime

from pydantic import BaseModel


class SavedJobCreate(BaseModel):
    job_id: str


class SavedJobResponse(BaseModel):
    id: str
    job_id: str
    user_id: str
    saved_at: datetime