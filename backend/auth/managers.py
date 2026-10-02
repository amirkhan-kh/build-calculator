from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from auth.services.password_service import PasswordService
from auth.services.token_service import TokenService
from core.exceptions import InvalidToken
from users.repositories import UserRepository


class AuthManager:
    def __init__(self, db: AsyncSession):
        self.user_repository = UserRepository(db)
        self.password_service = PasswordService()
        self.token_service = TokenService()

    async def authenticate(self, username: str, password: str) -> dict:
        user = await self.user_repository.get_user_by_username(username)

        if user is None or not (await self.password_service.verify_password(password, user.hashed_password)):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
            )

        if user.firm_id and user.firm and not user.firm.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Firma faol emas",
            )

        return await self.token_service.get_token(user)

    async def refresh_tokens(self, refresh_token: str) -> dict:
        payload = await self.token_service.decode_token(refresh_token, validate_is_refresh=True)

        username = payload.get("username")
        user = await self.user_repository.get_user_by_username(username)

        new_payload = await self.token_service.get_token(user)
        return new_payload

    async def get_me(self, token: str):
        payload = await self.token_service.decode_token(token)
        username = payload.get("username")

        user = await self.user_repository.get_user_by_username(username)

        if not user:
            raise InvalidToken("Invalid credentials.")

        if user.firm_id and user.firm and not user.firm.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Firma faol emas",
            )

        return user










