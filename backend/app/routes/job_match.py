from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from bson import ObjectId

from app.database.mongodb import get_database
from app.utils.security import decode_access_token
from app.services.job_matcher import calculate_job_match
from app.services.resume_analyzer import extract_text_from_resume


router = APIRouter(
    prefix="/ai/job-match",
    tags=["AI Job Matching"]
)

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        return decode_access_token(credentials.credentials)
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


@router.get("/{job_id}")
def match_resume_with_job(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()

    user_id = current_user.get("sub")

    try:
        object_id = ObjectId(job_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )

    job = db.jobs.find_one({"_id": object_id})

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    resume = db.resumes.find_one(
        {"user_id": user_id},
        sort=[("uploaded_at", -1)]
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found. Please upload a resume first."
        )

    try:
        resume_text = extract_text_from_resume(
            resume["file_path"]
        )

        result = calculate_job_match(
            resume_text,
            job
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Job matching failed: {str(e)}"
        )

    return {
        "job_id": str(job["_id"]),
        "job_title": job["title"],
        "company": job["company"],
        "resume_id": str(resume["_id"]),
        "filename": resume["filename"],
        "match": result
    }