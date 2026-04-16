from datetime import datetime

from pydantic import BaseModel


class BorrowOut(BaseModel):
    id: int
    book_id: int
    due_date: datetime
    returned: bool

    model_config = {"from_attributes": True}
