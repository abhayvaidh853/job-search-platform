from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    company: str = Field(..., min_length=2, max_length=150)
    location: str
    description: str
    job_type: str
    work_mode: str
    experience: str
    salary: Optional[str] = None
    skills: list[str] = []
    

class JobResponse(BaseModel):
    id: str
    title: str
    company: str
    location: str
    description: str
    job_type: str
    work_mode: str
    experience: str
    salary: Optional[str] = None
    skills: list[str]
    created_at: datetime