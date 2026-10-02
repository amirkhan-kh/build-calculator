from passlib.hash import argon2


class PasswordService:
    @staticmethod
    async def hash_password(password: str) -> str:
        return argon2.hash(password)

    @staticmethod
    async def verify_password(password: str, hashed_password: str) -> bool:
        return argon2.verify(password, hashed_password)









