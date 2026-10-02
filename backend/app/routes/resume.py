import os
import shutil
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database.mongodb import get_database
from app.utils.security import decode_access_token

router = APIRouter(prefix="/resume", tags=["Resume"])

security = HTTPBearer()

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token_data = decode_access_token(credentials.credentials)
        return token_data
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


@router.post("/upload")
def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    allowed_extensions = [".pdf", ".doc", ".docx"]

    file_extension = os.path.splitext(file.filename)[1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOC and DOCX files are allowed"
        )

    user_id = current_user.get("sub")

    filename = (
        f"{user_id}_"
        f"{int(datetime.now(timezone.utc).timestamp())}"
        f"{file_extension}"
    )

    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db = get_database()

    resume_data = {
        "user_id": user_id,
        "filename": file.filename,
        "stored_filename": filename,
        "file_path": file_path,
        "uploaded_at": datetime.now(timezone.utc)
    }

    result = db.resumes.insert_one(resume_data)

    return {
        "message": "Resume uploaded successfully",
        "resume_id": str(result.inserted_id),
        "filename": file.filename
    }


@router.get("/my")
def get_my_resume(
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
            detail="Resume not found"
        )

    return {
        "resume_id": str(resume["_id"]),
        "filename": resume["filename"],
        "stored_filename": resume["stored_filename"],
        "file_path": resume["file_path"],
        "uploaded_at": resume["uploaded_at"]
    }