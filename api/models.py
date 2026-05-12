import json
import os
import re
import uuid
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


def create_product(data: dict, base_url: str) -> Optional[ProductOut]:
    """Crea un nuevo producto con ID generado desde el nombre y lo retorna."""
    slug = re.sub(r"[^a-z0-9]+", "-", data["name"].lower()).strip("-")
    product_id = f"{slug}-{uuid.uuid4().hex[:6]}"
    sizes_json = json.dumps(
        [{"label": s["label"], "price": s["price"]} for s in data.get("sizes", [])]
    )
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO products
               (id, name, note, origin, process, elevation,
                sticker_text, sticker_color, sizes_json, sold_out, image_filename)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)""",
            (
                product_id,
                data["name"],
                data["note"],
                data["origin"],
                data["process"],
                data.get("elevation", ""),
                data.get("sticker_text", ""),
                data.get("sticker_color", "#de6f14"),
                sizes_json,
                1 if data.get("sold_out") else 0,
            ),
        )
        conn.commit()
    return get_product(product_id, base_url)


def update_product(product_id: str, data: dict, base_url: str) -> Optional[ProductOut]:
    """Actualiza los campos de texto/metadata de un producto. No toca image_filename."""
    sizes_json = json.dumps(
        [{"label": s["label"], "price": s["price"]} for s in data.get("sizes", [])]
    )
    with get_conn() as conn:
        result = conn.execute(
            """UPDATE products SET
               name=?, note=?, origin=?, process=?, elevation=?,
               sticker_text=?, sticker_color=?, sizes_json=?, sold_out=?
               WHERE id=?""",
            (
                data["name"],
                data["note"],
                data["origin"],
                data["process"],
                data.get("elevation", ""),
                data.get("sticker_text", ""),
                data.get("sticker_color", "#de6f14"),
                sizes_json,
                1 if data.get("sold_out") else 0,
                product_id,
            ),
        )
        conn.commit()
    if result.rowcount == 0:
        return None
    return get_product(product_id, base_url)


def delete_product(product_id: str) -> bool:
    """Elimina un producto y su archivo de imagen. Retorna True si fue eliminado."""
    uploads_dir = os.getenv("UPLOADS_DIR", "/app/uploads")
    with get_conn() as conn:
        row = conn.execute(
            "SELECT image_filename FROM products WHERE id = ?", (product_id,)
        ).fetchone()
        if not row:
            return False
        if row["image_filename"]:
            filepath = os.path.join(uploads_dir, row["image_filename"])
            try:
                os.remove(filepath)
            except FileNotFoundError:
                pass
        result = conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
        conn.commit()
    return result.rowcount > 0
