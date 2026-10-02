from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from app.database.mongodb import get_database
from app.utils.dependencies import get_current_admin
from app.utils.security import hash_password, verify_password


router = APIRouter(
    prefix="/settings",
    tags=["Admin Settings"]
)


# =========================================================
# MODELS
# =========================================================

class ProfileUpdate(BaseModel):
    name: str
    email: EmailStr
    phone: str


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str


class NotificationSettings(BaseModel):
    newApplications: bool
    newUsers: bool
    jobUpdates: bool
    emailNotifications: bool


class PlatformSettings(BaseModel):
    platformName: str
    supportEmail: EmailStr
    defaultJobStatus: str
    maintenanceMode: bool


# =========================================================
# GET ADMIN SETTINGS
# =========================================================

@router.get("/")
def get_admin_settings(
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    admin_id = current_admin.get("sub")

    try:
        admin = db.users.find_one({
            "_id": ObjectId(admin_id)
        })
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid admin ID"
        )

    if not admin:
        raise HTTPException(
            status_code=404,
            detail="Admin user not found"
        )

    settings = db.admin_settings.find_one({
        "admin_id": admin_id
    })

    if not settings:
        settings = {
            "notifications": {
                "newApplications": True,
                "newUsers": True,
                "jobUpdates": True,
                "emailNotifications": True
            },
            "platform": {
                "platformName": "JobAI",
                "supportEmail": "support@jobai.com",
                "defaultJobStatus": "Active",
                "maintenanceMode": False
            }
        }

    return {
        "profile": {
            "name": admin.get(
                "name",
                "JobAI Admin"
            ),
            "email": admin.get(
                "email",
                "admin@jobai.com"
            ),
            "phone": admin.get(
                "phone",
                ""
            )
        },
        "notifications": settings.get(
            "notifications",
            {
                "newApplications": True,
                "newUsers": True,
                "jobUpdates": True,
                "emailNotifications": True
            }
        ),
        "platform": settings.get(
            "platform",
            {
                "platformName": "JobAI",
                "supportEmail": "support@jobai.com",
                "defaultJobStatus": "Active",
                "maintenanceMode": False
            }
        )
    }


# =========================================================
# UPDATE ADMIN PROFILE
# =========================================================

@router.put("/profile")
def update_admin_profile(
    data: ProfileUpdate,
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    admin_id = current_admin.get("sub")

    try:
        object_id = ObjectId(admin_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid admin ID"
        )

    admin = db.users.find_one({
        "_id": object_id
    })

    if not admin:
        raise HTTPException(
            status_code=404,
            detail="Admin user not found"
        )

    existing_email = db.users.find_one({
        "email": data.email,
        "_id": {
            "$ne": object_id
        }
    })

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    db.users.update_one(
        {
            "_id": object_id
        },
        {
            "$set": {
                "name": data.name,
                "email": data.email,
                "phone": data.phone,
                "updated_at": datetime.now(
                    timezone.utc
                )
            }
        }
    )

    return {
        "message": "Profile settings saved successfully.",
        "profile": {
            "name": data.name,
            "email": data.email,
            "phone": data.phone
        }
    }


# =========================================================
# CHANGE ADMIN PASSWORD
# =========================================================

@router.put("/password")
def change_admin_password(
    data: PasswordUpdate,
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    admin_id = current_admin.get("sub")

    try:
        object_id = ObjectId(admin_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid admin ID"
        )

    admin = db.users.find_one({
        "_id": object_id
    })

    if not admin:
        raise HTTPException(
            status_code=404,
            detail="Admin user not found"
        )

    if not admin.get("password"):
        raise HTTPException(
            status_code=400,
            detail="Password authentication is not available for this account"
        )

    if not verify_password(
        data.current_password,
        admin["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Current password is incorrect"
        )

    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 6 characters"
        )

    if data.current_password == data.new_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different from current password"
        )

    db.users.update_one(
        {
            "_id": object_id
        },
        {
            "$set": {
                "password": hash_password(
                    data.new_password
                ),
                "updated_at": datetime.now(
                    timezone.utc
                )
            }
        }
    )

    return {
        "message": "Password updated successfully."
    }


# =========================================================
# SAVE NOTIFICATION SETTINGS
# =========================================================

@router.put("/notifications")
def update_notifications(
    data: NotificationSettings,
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    admin_id = current_admin.get("sub")

    db.admin_settings.update_one(
        {
            "admin_id": admin_id
        },
        {
            "$set": {
                "admin_id": admin_id,
                "notifications": data.model_dump(),
                "updated_at": datetime.now(
                    timezone.utc
                )
            }
        },
        upsert=True
    )

    return {
        "message": "Notification settings saved successfully.",
        "notifications": data.model_dump()
    }


# =========================================================
# SAVE PLATFORM SETTINGS
# =========================================================

@router.put("/platform")
def update_platform_settings(
    data: PlatformSettings,
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    admin_id = current_admin.get("sub")

    allowed_statuses = [
        "Active",
        "Pending",
        "Closed"
    ]

    if data.defaultJobStatus not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid default job status"
        )

    db.admin_settings.update_one(
        {
            "admin_id": admin_id
        },
        {
            "$set": {
                "admin_id": admin_id,
                "platform": data.model_dump(),
                "updated_at": datetime.now(
                    timezone.utc
                )
            }
        },
        upsert=True
    )

    return {
        "message": "Platform settings saved successfully.",
        "platform": data.model_dump()
    }
