import sqlite3
import os

DB_PATH = os.getenv("DB_PATH", "/app/data/cafe.db")


def get_conn() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id             TEXT PRIMARY KEY,
                name           TEXT NOT NULL,
                note           TEXT NOT NULL,
                origin         TEXT NOT NULL,
                process        TEXT NOT NULL,
                elevation      TEXT NOT NULL,
                sticker_text   TEXT NOT NULL,
                sticker_color  TEXT NOT NULL,
                sizes_json     TEXT NOT NULL,
                sold_out       INTEGER NOT NULL DEFAULT 0,
                image_filename TEXT
            )
        """)
        conn.commit()
