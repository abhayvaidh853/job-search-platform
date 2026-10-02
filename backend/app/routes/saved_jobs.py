from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database.mongodb import get_database
from app.models.saved_job import SavedJobCreate, SavedJobResponse
from app.utils.security import decode_access_token

router = APIRouter(prefix="/saved-jobs", tags=["Saved Jobs"])

security = HTTPBearer()


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


@router.post(
    "/",
    response_model=SavedJobResponse,
    status_code=201
)
def save_job(
    saved_job: SavedJobCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()

    try:
        job_id = ObjectId(saved_job.job_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )

    job = db.jobs.find_one({"_id": job_id})

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    user_id = current_user.get("sub")

    existing_saved_job = db.saved_jobs.find_one({
        "job_id": job_id,
        "user_id": user_id
    })

    if existing_saved_job:
        raise HTTPException(
            status_code=400,
            detail="Job already saved"
        )

    new_saved_job = {
        "job_id": job_id,
        "user_id": user_id,
        "saved_at": datetime.now(timezone.utc)
    }

    result = db.saved_jobs.insert_one(new_saved_job)

    return SavedJobResponse(
        id=str(result.inserted_id),
        job_id=str(new_saved_job["job_id"]),
        user_id=new_saved_job["user_id"],
        saved_at=new_saved_job["saved_at"]
    )


@router.get(
    "/my",
    response_model=list[SavedJobResponse]
)
def get_my_saved_jobs(
    current_user: dict = Depends(get_current_user)
):
    db = get_database()

    user_id = current_user.get("sub")

    saved_jobs = []

    for saved_job in db.saved_jobs.find(
        {"user_id": user_id}
    ).sort("saved_at", -1):

        saved_jobs.append(
            SavedJobResponse(
                id=str(saved_job["_id"]),
                job_id=str(saved_job["job_id"]),
                user_id=saved_job["user_id"],
                saved_at=saved_job["saved_at"]
            )
        )

    return saved_jobs



# ==========================================
# DELETE SAVED JOB
# ==========================================

@router.delete(
    "/{saved_job_id}"
)
def delete_saved_job(
    saved_job_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()

    try:
        object_id = ObjectId(saved_job_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid saved job ID"
        )

    user_id = current_user.get("sub")

    saved_job = db.saved_jobs.find_one({
        "_id": object_id,
        "user_id": user_id
    })

    if not saved_job:
        raise HTTPException(
            status_code=404,
            detail="Saved job not found"
        )

    db.saved_jobs.delete_one({
        "_id": object_id,
        "user_id": user_id
    })

    return {
        "message": "Saved job removed successfully",
        "saved_job_id": saved_job_id
    }
