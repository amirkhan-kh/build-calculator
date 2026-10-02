from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from auth.dependencies import has_permission, has_permissions
from coefficients.managers import BuildingCoefficientManager, BuildingCoefficientTypeManager
from coefficients.schemas import (AddCoefficientResponse, AddCoefficientBody, UpdateCoefficientBody,
                                  AddCoefficientTypeResponse, AddCoefficientTypeBody, UpdateCoefficientTypeBody,
                                  GetBCsWithBCTs)
from core.db.session import get_db


coefficients_router = APIRouter(prefix="/coefficients", tags=["Coefficients"])

"-------------------------------------------------------------------------------------------"

@coefficients_router.get(
    "/",
    response_model=list[AddCoefficientResponse],
    dependencies=[Depends(has_permission("view_building_coefficients"))]
)
async def get_coefficient_list(db: AsyncSession = Depends(get_db)):
    coefficient_manager = BuildingCoefficientManager(db)
    return await coefficient_manager.get_coefficient_list()

"-------------------------------------------------------------------------------------------"

@coefficients_router.post(
    "/add/",
    response_model=AddCoefficientResponse,
    dependencies=[Depends(has_permission("create_building_coefficients"))]
)
async def add_coefficient(create_coefficient: AddCoefficientBody, db: AsyncSession = Depends(get_db)):
    coefficient_manager = BuildingCoefficientManager(db)
    return await coefficient_manager.create_coefficient(**create_coefficient.model_dump())

"-------------------------------------------------------------------------------------------"

@coefficients_router.get(
    "/{coefficient_id}/",
    response_model=AddCoefficientResponse,
    dependencies=[Depends(has_permission("view_building_coefficients"))]
)
async def get_coefficient(coefficient_id: int, db: AsyncSession = Depends(get_db)):
    coefficient_manager = BuildingCoefficientManager(db)
    return await coefficient_manager.get_coefficient(coefficient_id)

"-------------------------------------------------------------------------------------------"

@coefficients_router.patch(
    "/{coefficient_id}/",
    response_model=AddCoefficientResponse,
    dependencies=[Depends(has_permission("update_building_coefficients"))]
)
async def edit_coefficient(coefficient_id: int, update_coefficient: UpdateCoefficientBody, db: AsyncSession = Depends(get_db)):
    coefficient_manager = BuildingCoefficientManager(db)
    return await coefficient_manager.update_coefficient(coefficient_id, **update_coefficient.model_dump(exclude_unset=True))

"-------------------------------------------------------------------------------------------"

@coefficients_router.delete(
    "/{coefficient_id}/",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(has_permission("delete_building_coefficients"))]
)
async def delete_coefficient(coefficient_id: int, db: AsyncSession = Depends(get_db)):
    coefficient_manager = BuildingCoefficientManager(db)
    return await coefficient_manager.delete_coefficient(coefficient_id)

""" -------------------------------------------------------------------------------------------------- """
""" -------------------------------------------------------------------------------------------------- """
""" -------------------------------------------------------------------------------------------------- """
""" -------------------------------------------------------------------------------------------------- """
""" -------------------------------------------------------------------------------------------------- """

coefficient_types_router = APIRouter(prefix="/coefficient-types", tags=["Coefficient Types"])

"-------------------------------------------------------------------------------------------"

@coefficient_types_router.get(
    "/",
    response_model=list[AddCoefficientTypeResponse],
    dependencies=[Depends(has_permission("view_building_coefficient_types"))]
)
async def get_coefficient_type_list(db: AsyncSession = Depends(get_db)):
    coefficient_type_manager = BuildingCoefficientTypeManager(db)
    return await coefficient_type_manager.get_coefficient_type_list()

"-------------------------------------------------------------------------------------------"

@coefficient_types_router.post(
    "/add/",
    response_model=AddCoefficientTypeResponse,
    dependencies=[Depends(has_permission("create_building_coefficient_types"))]
)
async def add_coefficient_type(create_coefficient_type: AddCoefficientTypeBody, db: AsyncSession = Depends(get_db)):
    coefficient_type_manager = BuildingCoefficientTypeManager(db)
    return await coefficient_type_manager.create_coefficient_type(**create_coefficient_type.model_dump())

"-------------------------------------------------------------------------------------------"

@coefficient_types_router.get(
    "/{coefficient_type_id}/",
    response_model=AddCoefficientTypeResponse,
    dependencies=[Depends(has_permission("view_building_coefficient_types"))]
)
async def get_coefficient_type(coefficient_type_id: int, db: AsyncSession = Depends(get_db)):
    coefficient_type_manager = BuildingCoefficientTypeManager(db)
    return await coefficient_type_manager.get_coefficient_type(coefficient_type_id)

"-------------------------------------------------------------------------------------------"

@coefficient_types_router.patch(
    "/{coefficient_type_id}/",
    response_model=AddCoefficientTypeResponse,
    dependencies=[Depends(has_permission("update_building_coefficient_types"))]
)
async def edit_coefficient_type(coefficient_type_id: int, update_coefficient_type: UpdateCoefficientTypeBody, db: AsyncSession = Depends(get_db)):
    coefficient_type_manager = BuildingCoefficientTypeManager(db)
    return await coefficient_type_manager.update_coefficient_type(coefficient_type_id, **update_coefficient_type.model_dump(exclude_unset=True))

"-------------------------------------------------------------------------------------------"

@coefficient_types_router.delete(
    "/{coefficient_type_id}/",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(has_permission("delete_building_coefficient_types"))]
)
async def delete_coefficient_type(coefficient_type_id: int, db: AsyncSession = Depends(get_db)):
    coefficient_type_manager = BuildingCoefficientTypeManager(db)
    return await coefficient_type_manager.delete_coefficient_type(coefficient_type_id)

"-------------------------------------------------------------------------------------------"


coefficients_common_router = APIRouter(prefix="/coefficients-common", tags=["Coefficients Common"])

"-------------------------------------------------------------------------------------------"

@coefficients_common_router.get(
    "/bcs-with-bcts-by-building-id/{building_id}/",
    response_model=list[GetBCsWithBCTs],
    dependencies=[Depends(has_permissions(["view_building_coefficient_types", "view_building_coefficients"]))]
)
async def get_bcs_with_bcts_by_building(building_id: int, db: AsyncSession = Depends(get_db)):
    coefficient_type_manager = BuildingCoefficientTypeManager(db)
    return await coefficient_type_manager.get_coefficient_types_by_building_id(building_id)

"-------------------------------------------------------------------------------------------"




