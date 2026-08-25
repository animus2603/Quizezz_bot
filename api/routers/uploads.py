import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 МБ


@router.post("")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "Файл слишком большой (максимум 15 МБ)")

    ext = Path(file.filename or "file").suffix
    safe_name = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / safe_name
    dest.write_bytes(content)

    return {"url": f"/uploads/{safe_name}", "filename": file.filename}
