from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.book import Book
from app.models.user import User
from app.schemas.book import BookCreate, BookOut, BookUpdate
from app.utils.deps import get_current_user, require_admin

router = APIRouter(prefix="/books", tags=["books"])


@router.get("", response_model=list[BookOut])
def list_books(db: Annotated[Session, Depends(get_db)]) -> list[Book]:
    return list(db.scalars(select(Book).order_by(Book.id)).all())


@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: int, db: Annotated[Session, Depends(get_db)]) -> Book:
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("", response_model=BookOut, status_code=status.HTTP_201_CREATED)
def create_book(
    body: BookCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
) -> Book:
    book = Book(
        title=body.title,
        author=body.author,
        genre=body.genre,
        description=body.description or "",
        available_copies=body.available_copies,
        image_url=body.image_url,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@router.put("/{book_id}", response_model=BookOut)
def update_book(
    book_id: int,
    body: BookUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
) -> Book:
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(book, k, v)
    db.commit()
    db.refresh(book)
    return book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
) -> None:
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
