from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field

from app.database.mongodb import get_database
from app.utils.dependencies import get_current_admin
from app.utils.security import hash_password


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


class AdminUserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: str = "user"
    status: str = "Active"


class AdminUserUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: str = "user"
    status: str = "Active"


class AdminUserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    status: str
    applications: int
    created_at: datetime


@router.get(
    "/",
    response_model=list[AdminUserResponse]
)
def get_all_users(
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    users = []

    for user in db.users.find().sort("created_at", -1):

        user_id = str(user["_id"])

        application_count = db.applications.count_documents({
            "user_id": user_id
        })

        users.append(
            AdminUserResponse(
                id=user_id,
                name=user["name"],
                email=user["email"],
                role=user.get("role", "user"),
                status=user.get("status", "Active"),
                applications=application_count,
                created_at=user["created_at"]
            )
        )

    return users


@router.post(
    "/",
    response_model=AdminUserResponse,
    status_code=201
)
def create_user(
    user: AdminUserCreate,
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    existing_user = db.users.find_one({
        "email": user.email
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hash_password("JobAI@123"),
        "role": user.role,
        "status": user.status,
        "created_at": datetime.now(timezone.utc)
    }

    result = db.users.insert_one(new_user)

    return AdminUserResponse(
        id=str(result.inserted_id),
        name=new_user["name"],
        email=new_user["email"],
        role=new_user["role"],
        status=new_user["status"],
        applications=0,
        created_at=new_user["created_at"]
    )


@router.put(
    "/{user_id}",
    response_model=AdminUserResponse
)
def update_user(
    user_id: str,
    user: AdminUserUpdate,
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    try:
        object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    existing_user = db.users.find_one({
        "_id": object_id
    })

    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    duplicate_email = db.users.find_one({
        "email": user.email,
        "_id": {
            "$ne": object_id
        }
    })

    if duplicate_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    db.users.update_one(
        {"_id": object_id},
        {
            "$set": {
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "status": user.status,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    application_count = db.applications.count_documents({
        "user_id": user_id
    })

    return AdminUserResponse(
        id=user_id,
        name=user.name,
        email=user.email,
        role=user.role,
        status=user.status,
        applications=application_count,
        created_at=existing_user["created_at"]
    )


@router.delete(
    "/{user_id}"
)
def delete_user(
    user_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()

    try:
        object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    existing_user = db.users.find_one({
        "_id": object_id
    })

    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if str(existing_user["_id"]) == current_admin.get("sub"):
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own admin account"
        )

    db.users.delete_one({
        "_id": object_id
    })

    return {
        "message": "User deleted successfully",
        "user_id": user_id
    }