from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut
from app.services import auth_service
from app.utils.deps import get_current_user
from app.utils.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(body: UserCreate, db: Annotated[Session, Depends(get_db)]) -> UserOut:
    try:
        user = auth_service.create_user(db, body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return UserOut.from_user(user)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> TokenResponse:
    user = auth_service.authenticate_user(db, body.email, body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token(
        str(user.id),
        extra={"email": user.email, "role": user.role},
    )
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.from_user(user),
    )


@router.get("/me", response_model=UserOut)
def me(current: Annotated[User, Depends(get_current_user)]) -> UserOut:
    return UserOut.from_user(current)
