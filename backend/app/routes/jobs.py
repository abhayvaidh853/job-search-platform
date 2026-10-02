from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.database.mongodb import get_database
from app.models.job import JobCreate, JobResponse
from app.utils.dependencies import get_current_admin


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


# ==========================================
# CREATE JOB
# ==========================================

@router.post(
    "/",
    response_model=JobResponse,
    status_code=201
)
def create_job(
    job: JobCreate,
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    new_job = {
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "description": job.description,
        "job_type": job.job_type,
        "work_mode": job.work_mode,
        "experience": job.experience,
        "salary": job.salary,
        "skills": job.skills,
        "created_at": datetime.now(timezone.utc),
    }

    result = db.jobs.insert_one(new_job)

    return JobResponse(
        id=str(result.inserted_id),
        **new_job
    )


# ==========================================
# GET ALL JOBS
# ==========================================

@router.get(
    "/",
    response_model=list[JobResponse]
)
def get_jobs():
    db = get_database()

    jobs = []

    for job in db.jobs.find().sort("created_at", -1):
        jobs.append(
            JobResponse(
                id=str(job["_id"]),
                title=job["title"],
                company=job["company"],
                location=job["location"],
                description=job["description"],
                job_type=job["job_type"],
                work_mode=job["work_mode"],
                experience=job["experience"],
                salary=job.get("salary"),
                skills=job.get("skills", []),
                created_at=job["created_at"],
            )
        )

    return jobs


# ==========================================
# GET SINGLE JOB
# ==========================================

@router.get(
    "/{job_id}",
    response_model=JobResponse
)
def get_job(job_id: str):
    db = get_database()

    try:
        object_id = ObjectId(job_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )

    job = db.jobs.find_one(
        {"_id": object_id}
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return JobResponse(
        id=str(job["_id"]),
        title=job["title"],
        company=job["company"],
        location=job["location"],
        description=job["description"],
        job_type=job["job_type"],
        work_mode=job["work_mode"],
        experience=job["experience"],
        salary=job.get("salary"),
        skills=job.get("skills", []),
        created_at=job["created_at"],
    )


# ==========================================
# UPDATE JOB
# ==========================================

@router.put(
    "/{job_id}",
    response_model=JobResponse
)
def update_job(
    job_id: str,
    job: JobCreate,
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    try:
        object_id = ObjectId(job_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )

    existing_job = db.jobs.find_one(
        {"_id": object_id}
    )

    if not existing_job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    updated_job = {
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "description": job.description,
        "job_type": job.job_type,
        "work_mode": job.work_mode,
        "experience": job.experience,
        "salary": job.salary,
        "skills": job.skills,
        "created_at": existing_job["created_at"],
        "updated_at": datetime.now(timezone.utc),
    }

    db.jobs.update_one(
        {"_id": object_id},
        {"$set": updated_job}
    )

    return JobResponse(
        id=job_id,
        **{
            key: value
            for key, value in updated_job.items()
            if key != "updated_at"
        }
    )


# ==========================================
# DELETE JOB
# ==========================================

@router.delete(
    "/{job_id}"
)
def delete_job(
    job_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    try:
        object_id = ObjectId(job_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )

    result = db.jobs.delete_one(
        {"_id": object_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return {
        "message": "Job deleted successfully",
        "job_id": job_id
    }