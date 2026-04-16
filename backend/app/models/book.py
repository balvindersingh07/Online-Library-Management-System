from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    author: Mapped[str] = mapped_column(String(255), nullable=False)
    genre: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    available_copies: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    borrows: Mapped[list["BorrowRecord"]] = relationship(
        "BorrowRecord", back_populates="book", cascade="all, delete-orphan"
    )
