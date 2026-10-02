from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.utils.security import decode_access_token


security = HTTPBearer()


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


def get_current_admin(
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user