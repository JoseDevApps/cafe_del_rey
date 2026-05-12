import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, status
from schemas import ProductOut, ImageUploadResponse, OkResponse, ProductCreate
from models import (
    get_all_products, get_product, set_product_image, clear_product_image,
    create_product, update_product, delete_product,
)
from auth import get_current_admin

UPLOADS_DIR = Path(os.getenv("UPLOADS_DIR", "/app/uploads"))

router = APIRouter(prefix="/products", tags=["products"])


def _base_url(request: Request) -> str:
    return str(request.base_url).rstrip("/")


@router.get("", response_model=list[ProductOut])
def list_products(request: Request):
    return get_all_products(_base_url(request))


@router.post("", response_model=ProductOut, status_code=201)
def create_product_endpoint(
    data: ProductCreate,
    request: Request,
    _: str = Depends(get_current_admin),
):
    product = create_product(data.model_dump(), _base_url(request))
    if not product:
        raise HTTPException(status_code=500, detail="Error al crear el producto")
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product_endpoint(
    product_id: str,
    data: ProductCreate,
    request: Request,
    _: str = Depends(get_current_admin),
):
    product = update_product(product_id, data.model_dump(), _base_url(request))
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product


@router.delete("/{product_id}", response_model=OkResponse)
def delete_product_endpoint(
    product_id: str,
    _: str = Depends(get_current_admin),
):
    success = delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return OkResponse()


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
