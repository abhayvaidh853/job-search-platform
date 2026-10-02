from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CompanyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: str
    location: str
    website: Optional[str] = None
    industry: str
    company_size: Optional[str] = None


class CompanyResponse(BaseModel):
    id: str
    name: str
    description: str
    location: str
    website: Optional[str] = None
    industry: str
    company_size: Optional[str] = None
    created_at: datetime