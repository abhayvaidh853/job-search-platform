from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.database.mongodb import get_database
from app.utils.security import decode_access_token
from app.services.resume_analyzer import extract_text_from_resume
from app.services.job_recommender import recommend_jobs


router = APIRouter(
    prefix="/ai/recommendations",
    tags=["AI Job Recommendations"]
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


@router.get("/")
def get_job_recommendations(
    current_user: dict = Depends(get_current_user)
):
    db = get_database()

    user_id = current_user.get("sub")

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

        jobs = list(
            db.jobs.find().sort("created_at", -1)
        )

        recommendations = recommend_jobs(
            resume_text,
            jobs
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Job recommendation failed: {str(e)}"
        )

    return {
        "resume_id": str(resume["_id"]),
        "filename": resume["filename"],
        "total_jobs": len(recommendations),
        "recommendations": recommendations
    }