from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.models.user import User
from app.services.blob_service import upload_bytes
from app.utils.deps import require_admin

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("")
async def upload_cover(
    file: Annotated[UploadFile, File()],
    _: Annotated[User, Depends(require_admin)],
) -> dict[str, str]:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    try:
        url = upload_bytes(
            data,
            file.content_type,
            file.filename or "cover.bin",
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e) or "Blob storage not configured",
        ) from e
    return {"url": url}
