import os
from datetime import datetime, timezone

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, status, Body

from google.oauth2 import id_token
from google.auth.transport import requests

from app.database.mongodb import get_database
from app.models.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.utils.security import hash_password, verify_password, create_access_token

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(user: UserCreate):
    db = get_database()

    existing_user = db.users.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": "user",
        "created_at": datetime.now(timezone.utc)
    }

    result = db.users.insert_one(new_user)

    return UserResponse(
        id=str(result.inserted_id),
        name=new_user["name"],
        email=new_user["email"],
        role=new_user["role"],
        created_at=new_user["created_at"]
    )


@router.post("/login", response_model=TokenResponse)
def login_user(user: UserLogin):
    db = get_database()

    existing_user = db.users.find_one({"email": user.email})

    if not existing_user or not existing_user.get("password"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        existing_user["password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "sub": str(existing_user["_id"]),
            "email": existing_user["email"],
            "role": existing_user["role"]
        }
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer"
    )


@router.post("/google", response_model=TokenResponse)
def google_login(
    credential: str = Body(..., embed=True)
):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="Google Client ID is not configured"
        )

    try:
        google_user = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )

    email = google_user.get("email")
    name = google_user.get("name", "Google User")
    email_verified = google_user.get("email_verified", False)

    if not email or not email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google email is not verified"
        )

    db = get_database()

    existing_user = db.users.find_one({
        "email": email
    })

    if not existing_user:
        new_user = {
            "name": name,
            "email": email,
            "password": None,
            "role": "user",
            "auth_provider": "google",
            "created_at": datetime.now(timezone.utc)
        }

        result = db.users.insert_one(new_user)

        existing_user = {
            "_id": result.inserted_id,
            **new_user
        }

    access_token = create_access_token(
        {
            "sub": str(existing_user["_id"]),
            "email": existing_user["email"],
            "role": existing_user["role"]
        }
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer"
    )
    