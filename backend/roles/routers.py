from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from auth.dependencies import has_permission
from core.db.session import get_db
from roles.managers import RoleManager
from roles.schemas import RoleCreateBody, RoleCreateResponse, RoleListResponse, RoleGetResponse, RoleUpdateResponse, \
    RoleUpdateBody

router = APIRouter(prefix="/roles", tags=["Roles"])

"-------------------------------------------------------------------------------------------"

@router.get(
    "/",
    response_model=list[RoleListResponse],
    dependencies=[Depends(has_permission("view_roles"))]
)
async def get_role_list(db: AsyncSession = Depends(get_db)):
    role_manager = RoleManager(db)
    return await role_manager.get_role_list()

"-------------------------------------------------------------------------------------------"

@router.post(
    "/create/",
    response_model=RoleCreateResponse,
    dependencies=[Depends(has_permission("create_roles"))]
)
async def create_role(create_role_body: RoleCreateBody, db: AsyncSession = Depends(get_db)):
    role_manager = RoleManager(db)
    return await role_manager.create_role(**create_role_body.model_dump())

"-------------------------------------------------------------------------------------------"

@router.get(
    "/{role_id}/",
    response_model=RoleGetResponse,
    dependencies=[Depends(has_permission("view_roles"))]
)
async def get_role(role_id: int, db: AsyncSession = Depends(get_db)):
    role_manager = RoleManager(db)
    return await role_manager.get_role(role_id)

"-------------------------------------------------------------------------------------------"

@router.patch(
    "/{role_id}/",
    response_model=RoleUpdateResponse,
    dependencies=[Depends(has_permission("update_roles"))]
)
async def update_role(role_id: int, update_role_body: RoleUpdateBody, db: AsyncSession = Depends(get_db)):
    role_manager = RoleManager(db)
    return await role_manager.update_role(role_id, **update_role_body.model_dump())

"-------------------------------------------------------------------------------------------"

@router.delete(
    "/{role_id}/",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(has_permission("delete_roles"))]
)
async def delete_role(role_id: int, db: AsyncSession = Depends(get_db)):
    role_manager = RoleManager(db)
    return await role_manager.delete_role(role_id)
