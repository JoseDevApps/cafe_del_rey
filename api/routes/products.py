import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, status
from schemas import ProductOut, ImageUploadResponse, OkResponse
from models import get_all_products, get_product, set_product_image, clear_product_image
from auth import get_current_admin

UPLOADS_DIR = Path(os.getenv("UPLOADS_DIR", "/app/uploads"))

router = APIRouter(prefix="/products", tags=["products"])


def _base_url(request: Request) -> str:
    return str(request.base_url).rstrip("/")


@router.get("", response_model=list[ProductOut])
def list_products(request: Request):
    return get_all_products(_base_url(request))


@router.get("/{product_id}", response_model=ProductOut)
def get_one_product(product_id: str, request: Request):
    product = get_product(product_id, _base_url(request))
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return product


@router.post("/{product_id}/image", response_model=ImageUploadResponse)
async def upload_product_image(
    product_id: str,
    request: Request,
    file: UploadFile = File(...),
    _: str = Depends(get_current_admin),
):
    product = get_product(product_id, _base_url(request))
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Formato de imagen no permitido. Usa JPEG, PNG, WebP o GIF.",
        )

    ext = Path(file.filename or "img.jpg").suffix or ".jpg"
    filename = f"{product_id}-{uuid.uuid4().hex[:8]}{ext}"

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    dest = UPLOADS_DIR / filename
    content = await file.read()
    dest.write_bytes(content)

    # Remove old file if present
    if product.image_url:
        old_filename = product.image_url.split("/uploads/")[-1]
        old_path = UPLOADS_DIR / old_filename
        if old_path.exists() and old_path.name != filename:
            old_path.unlink(missing_ok=True)

    set_product_image(product_id, filename)
    return ImageUploadResponse(image_url=f"{_base_url(request)}/uploads/{filename}")


@router.delete("/{product_id}/image", response_model=OkResponse)
def delete_product_image(
    product_id: str,
    request: Request,
    _: str = Depends(get_current_admin),
):
    product = get_product(product_id, _base_url(request))
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    if product.image_url:
        filename = product.image_url.split("/uploads/")[-1]
        path = UPLOADS_DIR / filename
        path.unlink(missing_ok=True)

    clear_product_image(product_id)
    return OkResponse()
