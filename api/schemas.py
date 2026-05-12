from pydantic import BaseModel
from typing import Optional


class SizeItem(BaseModel):
    label: str
    price: str


class ProductOut(BaseModel):
    id: str
    name: str
    note: str
    origin: str
    process: str
    elevation: str
    sticker_text: str
    sticker_color: str
    sizes: list[SizeItem]
    sold_out: bool
    image_url: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ImageUploadResponse(BaseModel):
    image_url: str


class OkResponse(BaseModel):
    ok: bool = True


class ProductCreate(BaseModel):
    name: str
    note: str
    origin: str
    process: str
    elevation: str = ""
    sticker_text: str = ""
    sticker_color: str = "#de6f14"
    sizes: list[SizeItem] = []
    sold_out: bool = False
