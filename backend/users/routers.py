from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from auth.dependencies import get_current_user, has_permission
from core.db.session import get_db
from users.filters import UsersFilter
from users.managers import UserManager
from users.models import User
from users.schemas import UserListResponse, UserCreateResponse, UserCreateBody, UserGetResponse, UserUpdateResponse, \
    UserUpdateBody

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/",
    response_model=list[UserListResponse],
    dependencies=[Depends(has_permission("view_users"))]
)
async def get_user_list(
        db: AsyncSession = Depends(get_db),
        filters: UsersFilter = Depends(),
        user: User = Depends(get_current_user),
):
    user_manager = UserManager(db)
    return await user_manager.get_user_list(filters, firm_id=user.firm_id)

@router.post(
    "/create/",
    response_model=UserCreateResponse,
    dependencies=[Depends(has_permission("create_users"))]
)
async def create_user(
        create_user_body: UserCreateBody,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(get_current_user),
):
    user_manager = UserManager(db)
    payload = create_user_body.model_dump()
    payload["firm_id"] = user.firm_id
    payload["is_platform_admin"] = False
    return await user_manager.create_user(**payload)

@router.get(
    "/{user_id}/",
    response_model=UserGetResponse,
    dependencies=[Depends(has_permission("view_users"))]
)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user_manager = UserManager(db)
    return await user_manager.get_user(user_id)

@router.patch(
    "/{user_id}/",
    response_model=UserUpdateResponse,
    dependencies=[Depends(has_permission("update_users"))]
)
async def update_user(user_id: int, update_user_body: UserUpdateBody, db: AsyncSession = Depends(get_db)):
    user_manager = UserManager(db)
    return await user_manager.update_user(user_id, **update_user_body.model_dump())

@router.delete(
    "/{user_id}/",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(has_permission("delete_users"))]
)
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user_manager = UserManager(db)
    return await user_manager.delete_user(user_id)















