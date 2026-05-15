import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

from database import init_db
from seed import seed
from routes.auth import router as auth_router
from routes.products import router as products_router

UPLOADS_DIR = Path(os.getenv("UPLOADS_DIR", "/app/uploads"))
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:4001",
).split(",")

logger = logging.getLogger("cafe.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    init_db()
    seed()
    yield


app = FastAPI(title="Café del Rey API", version="1.0.0", lifespan=lifespan)


def _error_response(message: str, code: str, details=None):
    return {
        "ok": False,
        "error": {
            "code": code,
            "message": message,
            "details": details,
        },
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(products_router)

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code >= 500:
        logger.error("HTTP %s at %s: %s", exc.status_code, request.url.path, exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_response(
            message=str(exc.detail),
            code=f"HTTP_{exc.status_code}",
            details={"path": request.url.path},
        ),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=_error_response(
            message="Solicitud inválida",
            code="VALIDATION_ERROR",
            details={"path": request.url.path, "issues": exc.errors()},
        ),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception at %s", request.url.path)
    return JSONResponse(
        status_code=500,
        content=_error_response(
            message="Error interno del servidor",
            code="INTERNAL_ERROR",
            details={"path": request.url.path},
        ),
    )


@app.get("/health")
def health():
    return {"status": "ok"}
