from pydantic import BaseModel, Field


class BookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=512)
    author: str = Field(min_length=1, max_length=255)
    genre: str = Field(min_length=1, max_length=128)
    description: str = ""
    available_copies: int = Field(ge=0, default=1)
    image_url: str | None = None


class BookUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=512)
    author: str | None = Field(default=None, min_length=1, max_length=255)
    genre: str | None = Field(default=None, min_length=1, max_length=128)
    description: str | None = None
    available_copies: int | None = Field(default=None, ge=0)
    image_url: str | None = None


class BookOut(BaseModel):
    id: int
    title: str
    author: str
    genre: str
    description: str
    available_copies: int
    image_url: str | None

    model_config = {"from_attributes": True}
