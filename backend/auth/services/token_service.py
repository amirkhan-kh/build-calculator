from datetime import datetime, timedelta

import jwt
from jwt import ExpiredSignatureError

from core.config import TIMEZONE, REFRESH_TIME, ACCESS_TIME, SECRET_KEY, ALGORITHM
from core.exceptions import InvalidToken
from users.models import User


class TokenService:
    @staticmethod
    async def _generate_token(user: User, is_refresh: bool = False) -> str:
        exp = datetime.now(tz=TIMEZONE) + (timedelta(minutes=int(REFRESH_TIME)) if is_refresh else timedelta(minutes=int(ACCESS_TIME)))
        token = jwt.encode(
            {
                "sub": str(user.id),
                "username": user.username,
                "exp": exp,
                "refresh": is_refresh
            },
            SECRET_KEY,
            ALGORITHM
        )
        return token

    async def get_token(self, user: User) -> dict:
        access_token = await self._generate_token(user)
        refresh_token = await self._generate_token(user, is_refresh=True)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }


    @staticmethod
    async def decode_token(token: str, validate_is_refresh: bool = False) -> dict:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)

            if validate_is_refresh:
                if not payload.get("refresh"):
                    raise InvalidToken("Invalid token")

            return payload
        except ExpiredSignatureError as exc:
            raise InvalidToken("Token has expired") from exc
        except Exception as exc:
            raise InvalidToken("Invalid token") from exc



