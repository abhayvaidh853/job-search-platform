from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.database.mongodb import get_database
from app.utils.security import decode_access_token
from app.services.resume_analyzer import analyze_resume


router = APIRouter(
    prefix="/ai/resume",
    tags=["AI Resume Analysis"]
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


@router.get("/analyze")
def analyze_my_resume(
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

    file_path = resume["file_path"]

    try:
        analysis = analyze_resume(file_path)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resume analysis failed: {str(e)}"
        )

    return {
        "resume_id": str(resume["_id"]),
        "filename": resume["filename"],
        "analysis": analysis
    }