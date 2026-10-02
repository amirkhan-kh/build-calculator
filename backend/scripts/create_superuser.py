import asyncio
from getpass import getpass

import core.models  # noqa: F401 — registers all SQLAlchemy mappers
from core.db.session import async_session
from users.models import User
from auth.services.password_service import PasswordService



async def main():
    fullname = input("fullname: ")
    phone = input("phone: ")
    username = input("Username: ")
    password = getpass("Password: ")

    password_match = False
    while not password_match:
        repeat_password = getpass("Repeat Password: ")
        password_match = password == repeat_password

    async with async_session() as session:
        user = User(
            phone=phone,
            fullname=fullname,
            username=username,
            hashed_password=await PasswordService.hash_password(password=password),
            is_superuser=True,
        )

        session.add(user)
        await session.commit()

        print("✅ User created successfully")


if __name__ == "__main__":
    asyncio.run(main())
