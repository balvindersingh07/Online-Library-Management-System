from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.book import Book
from app.models.borrow import BorrowRecord
from app.models.user import User
from app.schemas.book import BookOut
from app.schemas.borrow import BorrowOut
from app.services.borrow_service import borrow_book as borrow_svc
from app.services.borrow_service import return_book as return_svc
from app.utils.deps import get_current_user

router = APIRouter(tags=["borrow"])


class ActiveBorrowOut(BaseModel):
    id: int
    due_date: datetime
    returned: bool
    book: BookOut


@router.post("/borrow/{book_id}", response_model=BorrowOut)
def borrow(
    book_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> BorrowRecord:
    return borrow_svc(db, user.id, book_id)


@router.post("/return/{book_id}", response_model=BorrowOut)
def return_book_route(
    book_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> BorrowRecord:
    return return_svc(db, user.id, book_id)


@router.get("/me/borrows", response_model=list[ActiveBorrowOut])
def my_active_borrows(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> list[ActiveBorrowOut]:
    rows = db.scalars(
        select(BorrowRecord)
        .where(
            BorrowRecord.user_id == user.id,
            BorrowRecord.returned.is_(False),
        )
        .order_by(BorrowRecord.due_date)
    ).all()
    out: list[ActiveBorrowOut] = []
    for r in rows:
        b = db.get(Book, r.book_id)
        if not b:
            continue
        out.append(
            ActiveBorrowOut(
                id=r.id,
                due_date=r.due_date,
                returned=r.returned,
                book=BookOut.model_validate(b),
            )
        )
    return out
