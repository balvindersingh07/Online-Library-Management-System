from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.book import Book
from app.models.borrow import BorrowRecord


def borrow_book(db: Session, user_id: int, book_id: int) -> BorrowRecord:
    book = db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.available_copies <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No copies available",
        )

    existing = db.scalars(
        select(BorrowRecord).where(
            BorrowRecord.user_id == user_id,
            BorrowRecord.book_id == book_id,
            BorrowRecord.returned.is_(False),
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have this book borrowed",
        )

    book.available_copies -= 1
    due = datetime.now(UTC) + timedelta(days=14)
    rec = BorrowRecord(
        user_id=user_id,
        book_id=book_id,
        due_date=due,
        returned=False,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    db.refresh(book)
    return rec


def return_book(db: Session, user_id: int, book_id: int) -> BorrowRecord:
    rec = db.scalars(
        select(BorrowRecord).where(
            BorrowRecord.user_id == user_id,
            BorrowRecord.book_id == book_id,
            BorrowRecord.returned.is_(False),
        )
    ).first()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active loan for this book",
        )

    book = db.get(Book, book_id)
    if book:
        book.available_copies += 1

    rec.returned = True
    db.commit()
    db.refresh(rec)
    return rec
