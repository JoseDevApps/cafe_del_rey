import json
from typing import Optional
from database import get_conn
from schemas import ProductOut, SizeItem

UPLOADS_URL_PREFIX = ""  # set at runtime via build_image_url


def build_image_url(base_url: str, filename: Optional[str]) -> Optional[str]:
    if not filename:
        return None
    return f"{base_url}/uploads/{filename}"


def _row_to_product(row, base_url: str) -> ProductOut:
    sizes = [SizeItem(**s) for s in json.loads(row["sizes_json"])]
    return ProductOut(
        id=row["id"],
        name=row["name"],
        note=row["note"],
        origin=row["origin"],
        process=row["process"],
        elevation=row["elevation"],
        sticker_text=row["sticker_text"],
        sticker_color=row["sticker_color"],
        sizes=sizes,
        sold_out=bool(row["sold_out"]),
        image_url=build_image_url(base_url, row["image_filename"]),
    )


def get_all_products(base_url: str) -> list[ProductOut]:
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM products ORDER BY rowid").fetchall()
    return [_row_to_product(r, base_url) for r in rows]


def get_product(product_id: str, base_url: str) -> Optional[ProductOut]:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if not row:
        return None
    return _row_to_product(row, base_url)


def set_product_image(product_id: str, filename: str) -> bool:
    with get_conn() as conn:
        result = conn.execute(
            "UPDATE products SET image_filename = ? WHERE id = ?",
            (filename, product_id),
        )
        conn.commit()
    return result.rowcount > 0


def clear_product_image(product_id: str) -> bool:
    with get_conn() as conn:
        result = conn.execute(
            "UPDATE products SET image_filename = NULL WHERE id = ?",
            (product_id,),
        )
        conn.commit()
    return result.rowcount > 0
