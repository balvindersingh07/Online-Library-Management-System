import uuid

from azure.core.exceptions import AzureError
from azure.storage.blob import BlobServiceClient, ContentSettings

from app.config import get_settings


def get_blob_service() -> BlobServiceClient | None:
    settings = get_settings()
    if not settings.azure_storage_connection_string:
        return None
    return BlobServiceClient.from_connection_string(
        settings.azure_storage_connection_string
    )


def ensure_container(client: BlobServiceClient, container: str) -> None:
    try:
        client.get_container_client(container).get_container_properties()
    except Exception:
        client.create_container(container)


def upload_bytes(
    data: bytes,
    content_type: str | None,
    filename_hint: str,
) -> str:
    settings = get_settings()
    client = get_blob_service()
    if not client:
        raise RuntimeError("Azure Blob is not configured")

    container = settings.azure_blob_container
    ensure_container(client, container)

    ext = ""
    if "." in filename_hint:
        ext = "." + filename_hint.rsplit(".", 1)[-1].lower()
        if ext not in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
            ext = ""

    blob_name = f"{uuid.uuid4().hex}{ext}"
    blob_client = client.get_blob_client(container=container, blob=blob_name)

    kwargs = {}
    if content_type:
        kwargs["content_settings"] = ContentSettings(content_type=content_type)

    try:
        blob_client.upload_blob(data, overwrite=True, **kwargs)
    except AzureError as e:
        raise RuntimeError(str(e)) from e

    return blob_client.url
