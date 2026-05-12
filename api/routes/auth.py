from fastapi import APIRouter, HTTPException, status
from schemas import LoginRequest, TokenResponse
from auth import verify_credentials, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    if not verify_credentials(body.username, body.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    token = create_access_token(subject=body.username)
    return TokenResponse(access_token=token)
