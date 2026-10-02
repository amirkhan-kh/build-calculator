from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_current_user
from auth.schemas import Token, GetMe
from auth.managers import AuthManager
from core.db.session import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/token/", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthManager(db=db)
    return await auth_service.authenticate(form_data.username, form_data.password)


@router.post("/refresh/", response_model=Token)
async def refresh_tokens(refresh_token: str, db: AsyncSession = Depends(get_db)):
    auth_service = AuthManager(db=db)
    return await auth_service.refresh_tokens(refresh_token)


@router.get("/me", response_model=GetMe)
async def get_me(user = Depends(get_current_user)):
    return user














