from typing import Any

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    id: int
    email: str
    role: str
    name: str | None = None

    model_config = {"from_attributes": True}

    @classmethod
    def from_user(cls, user: Any) -> "UserOut":
        local = user.email.split("@")[0] or "reader"
        name = local[:1].upper() + local[1:]
        return cls(id=user.id, email=user.email, role=user.role, name=name)
