from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from auth.dependencies import get_current_user, has_permission
from buildings.filters import BuildingFilter
from buildings.managers import BuildingManager
from buildings.schemas import AddBuildingResponse, AddBuildingBody, UpdateBuildingBody
from core.db.session import get_db
from users.models import User


router = APIRouter(prefix="/buildings", tags=["Buildings"])

"-------------------------------------------------------------------------------------------"

@router.get(
    "/",
    response_model=list[AddBuildingResponse],
    dependencies=[Depends(has_permission("view_buildings"))]
)
async def get_building_list(
        db: AsyncSession = Depends(get_db),
        filters: BuildingFilter = Depends(),
        user: User = Depends(get_current_user),
):
    building_manager = BuildingManager(db)
    return await building_manager.get_building_list(filters, firm_id=user.firm_id)

"-------------------------------------------------------------------------------------------"

@router.post(
    "/add/",
    response_model=AddBuildingResponse,
    dependencies=[Depends(has_permission("create_buildings"))]
)
async def add_building(
        create_complex: AddBuildingBody,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(get_current_user),
):
    building_manager = BuildingManager(db)
    return await building_manager.create_building(firm_id=user.firm_id, **create_complex.model_dump())

"-------------------------------------------------------------------------------------------"

@router.get(
    "/{building_id}/",
    response_model=AddBuildingResponse,
    dependencies=[Depends(has_permission("view_buildings"))]
)
async def get_building(
        building_id: int,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(get_current_user),
):
    building_manager = BuildingManager(db)
    return await building_manager.get_building(building_id, firm_id=user.firm_id)

"-------------------------------------------------------------------------------------------"

@router.patch(
    "/{building_id}/",
    response_model=AddBuildingResponse,
    dependencies=[Depends(has_permission("update_buildings"))]
)
async def edit_building(
        building_id: int,
        update_building: UpdateBuildingBody,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(get_current_user),
):
    building_manager = BuildingManager(db)
    return await building_manager.update_building(
        building_id,
        firm_id=user.firm_id,
        **update_building.model_dump(exclude_unset=True),
    )

"-------------------------------------------------------------------------------------------"

@router.delete(
    "/{building_id}/",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(has_permission("delete_buildings"))]
)
async def delete_building(
        building_id: int,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(get_current_user),
):
    building_manager = BuildingManager(db)
    return await building_manager.delete_building(building_id, firm_id=user.firm_id)


