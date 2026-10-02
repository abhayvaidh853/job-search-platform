from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from app.database.mongodb import get_database
from app.models.application import ApplicationCreate, ApplicationResponse
from app.utils.security import decode_access_token
from app.utils.dependencies import get_current_admin


router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)

security = HTTPBearer()


# =========================================================
# USER AUTHENTICATION
# =========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token_data = decode_access_token(
            credentials.credentials
        )
        return token_data

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


# =========================================================
# ADMIN APPLICATION MODEL
# =========================================================

class AdminApplicationStatusUpdate(BaseModel):
    status: str


# =========================================================
# CREATE APPLICATION
# =========================================================

@router.post(
    "/",
    response_model=ApplicationResponse,
    status_code=201
)
def create_application(
    application: ApplicationCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()

    try:
        job_id = ObjectId(application.job_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )

    job = db.jobs.find_one({
        "_id": job_id
    })

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    user_id = current_user.get("sub")

    existing_application = db.applications.find_one({
        "job_id": job_id,
        "user_id": user_id
    })

    if existing_application:
        raise HTTPException(
            status_code=400,
            detail="You have already applied for this job"
        )

    new_application = {
        "job_id": job_id,
        "user_id": user_id,
        "cover_letter": application.cover_letter,
        "status": "Pending",
        "applied_at": datetime.now(timezone.utc)
    }

    result = db.applications.insert_one(
        new_application
    )

    return ApplicationResponse(
        id=str(result.inserted_id),
        job_id=str(new_application["job_id"]),
        user_id=new_application["user_id"],
        cover_letter=new_application["cover_letter"],
        status=new_application["status"],
        applied_at=new_application["applied_at"]
    )


# =========================================================
# GET MY APPLICATIONS
# =========================================================

@router.get(
    "/my",
    response_model=list[ApplicationResponse]
)
def get_my_applications(
    current_user: dict = Depends(get_current_user)
):
    db = get_database()

    user_id = current_user.get("sub")

    applications = []

    for application in db.applications.find(
        {
            "user_id": user_id
        }
    ).sort(
        "applied_at",
        -1
    ):

        applications.append(
            ApplicationResponse(
                id=str(application["_id"]),
                job_id=str(application["job_id"]),
                user_id=application["user_id"],
                cover_letter=application.get(
                    "cover_letter"
                ),
                status=application.get(
                    "status",
                    "Pending"
                ),
                applied_at=application["applied_at"]
            )
        )

    return applications


# =========================================================
# ADMIN — GET ALL APPLICATIONS
# =========================================================

@router.get(
    "/admin",
)
def get_all_applications(
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    applications = []

    cursor = db.applications.find().sort(
        "applied_at",
        -1
    )

    for application in cursor:

        # ---------------------------------------------
        # Get user
        # ---------------------------------------------

        user = None

        try:
            user = db.users.find_one({
                "_id": ObjectId(
                    application["user_id"]
                )
            })
        except Exception:
            pass

        # ---------------------------------------------
        # Get job
        # ---------------------------------------------

        job = None

        try:
            job = db.jobs.find_one({
                "_id": application["job_id"]
            })
        except Exception:
            pass

        applications.append({
            "id": str(application["_id"]),

            "applicant": (
                user.get("name")
                if user
                else "Unknown Applicant"
            ),

            "email": (
                user.get("email")
                if user
                else "Unknown Email"
            ),

            "job": (
                job.get("title")
                if job
                else "Unknown Job"
            ),

            "company": (
                job.get("company")
                if job
                else "Unknown Company"
            ),

            "status": application.get(
                "status",
                "Pending"
            ),

            "appliedOn": application[
                "applied_at"
            ].strftime("%b %d, %Y"),

            "cover_letter": application.get(
                "cover_letter"
            ),

            "job_id": str(
                application["job_id"]
            ),

            "user_id": application[
                "user_id"
            ]
        })

    return applications


# =========================================================
# ADMIN — UPDATE APPLICATION STATUS
# =========================================================

@router.put(
    "/admin/{application_id}"
)
def update_application_status(
    application_id: str,
    data: AdminApplicationStatusUpdate,
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    allowed_statuses = [
        "Pending",
        "Shortlisted",
        "Interview",
        "Hired",
        "Rejected"
    ]

    if data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid application status"
        )

    try:
        object_id = ObjectId(
            application_id
        )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid application ID"
        )

    application = db.applications.find_one({
        "_id": object_id
    })

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    db.applications.update_one(
        {
            "_id": object_id
        },
        {
            "$set": {
                "status": data.status,
                "updated_at": datetime.now(
                    timezone.utc
                )
            }
        }
    )

    return {
        "message": "Application status updated successfully",
        "id": application_id,
        "status": data.status
    }


# =========================================================
# ADMIN — DELETE APPLICATION
# =========================================================

@router.delete(
    "/admin/{application_id}"
)
def delete_application(
    application_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    try:
        object_id = ObjectId(
            application_id
        )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid application ID"
        )

    application = db.applications.find_one({
        "_id": object_id
    })

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    db.applications.delete_one({
        "_id": object_id
    })

    return {
        "message": "Application deleted successfully",
        "id": application_id
    }