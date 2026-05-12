"""Run once to populate the products table with initial data."""
import json
import sys
from database import get_conn, init_db

PRODUCTS = [
    {
        "id": "rey-1",
        "name": "Rey Miel",
        "note": "Dulzor tropical + cuerpo redondo. Para espresso que sonríe.",
        "origin": "Caranavi · Yungas",
        "process": "Honey",
        "elevation": "1,450–1,750 msnm",
        "sticker_text": "Lote Miel",
        "sticker_color": "color-mix(in oklab, var(--cafe-lilac) 72%, white)",
        "sizes_json": json.dumps([
            {"label": "250 g", "price": "Bs 68"},
            {"label": "1 kg",  "price": "Bs 240"},
            {"label": "2 kg",  "price": "Bs 450"},
        ]),
        "sold_out": 0,
    },
    {
        "id": "rey-2",
        "name": "Bosque Lavado",
        "note": "Brillante, limpio, con notas cítricas suaves y cacao.",
        "origin": "Irupana · Yungas",
        "process": "Lavado",
        "elevation": "1,500–1,900 msnm",
        "sticker_text": "Altura",
        "sticker_color": "color-mix(in oklab, var(--cafe-yungas) 70%, white)",
        "sizes_json": json.dumps([
            {"label": "250 g", "price": "Bs 72"},
            {"label": "1 kg",  "price": "Bs 255"},
            {"label": "2 kg",  "price": "Bs 480"},
        ]),
        "sold_out": 0,
    },
    {
        "id": "rey-3",
        "name": "Dorada Natural",
        "note": "Fruta madura, aroma a panela y final largo. Puro sol.",
        "origin": "Chulumani · Yungas",
        "process": "Natural",
        "elevation": "1,300–1,650 msnm",
        "sticker_text": "Natural",
        "sticker_color": "color-mix(in oklab, var(--cafe-terracotta) 65%, white)",
        "sizes_json": json.dumps([
            {"label": "250 g", "price": "Bs 74"},
            {"label": "1 kg",  "price": "Bs 265"},
            {"label": "2 kg",  "price": "Bs 500"},
        ]),
        "sold_out": 1,
    },
]


def seed():
    init_db()
    with get_conn() as conn:
        inserted = 0
        for p in PRODUCTS:
            existing = conn.execute("SELECT id FROM products WHERE id = ?", (p["id"],)).fetchone()
            if not existing:
                conn.execute(
                    """INSERT INTO products
                       (id, name, note, origin, process, elevation,
                        sticker_text, sticker_color, sizes_json, sold_out)
                       VALUES (:id,:name,:note,:origin,:process,:elevation,
                               :sticker_text,:sticker_color,:sizes_json,:sold_out)""",
                    p,
                )
                inserted += 1
        conn.commit()
    print(f"Seed completado: {inserted} producto(s) insertado(s).")


if __name__ == "__main__":
    seed()
