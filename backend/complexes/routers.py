from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from auth.dependencies import get_current_user, has_permission
from buildings.image_sevices import save_image, delete_image
from complexes.filters import ComplexFilter
from complexes.repositories import ComplexRepository
from complexes.schemas import AddComplexResponse, AddComplexBody, UpdateComplexBody
from core.db.session import get_db
from users.models import User

router = APIRouter(prefix="/complexes", tags=["Complexes"])

"-------------------------------------------------------------------------------------------"

@router.get(
    "/",
    response_model=list[AddComplexResponse],
    dependencies=[Depends(has_permission("view_complexes"))]
)
async def get_complex_list(
        db: AsyncSession = Depends(get_db),
        filters: ComplexFilter = Depends(),
        user: User = Depends(get_current_user),
):
    complex_repo = ComplexRepository(db)
    return await complex_repo.get_complex_list(filters, firm_id=user.firm_id)

"-------------------------------------------------------------------------------------------"

@router.post(
    "/add/",
    response_model=AddComplexResponse,
    dependencies=[Depends(has_permission("create_complexes"))]
)
async def add_complex(
        create_complex: AddComplexBody,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(get_current_user),
):
    complex_repo = ComplexRepository(db)
    payload = create_complex.model_dump()
    payload["firm_id"] = user.firm_id
    return await complex_repo.create_complex(**payload)

"-------------------------------------------------------------------------------------------"

@router.get(
    "/{complex_id}/",
    response_model=AddComplexResponse,
    dependencies=[Depends(has_permission("view_complexes"))]
)
async def get_complex(
        complex_id: int,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(get_current_user),
):
    complex_repo = ComplexRepository(db)
    return await complex_repo.get_complex(complex_id, firm_id=user.firm_id)

"-------------------------------------------------------------------------------------------"

@router.patch(
    "/{complex_id}/",
    response_model=AddComplexResponse,
    dependencies=[Depends(has_permission("update_complexes"))]
)
async def edit_complex(
        complex_id: int,
        update_complex: UpdateComplexBody,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(get_current_user),
):
    complex_repo = ComplexRepository(db)
    return await complex_repo.update_complex(
        complex_id,
        firm_id=user.firm_id,
        **update_complex.model_dump(exclude_unset=True),
    )

"-------------------------------------------------------------------------------------------"

@router.delete(
    "/{complex_id}/",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(has_permission("delete_complexes"))]
)
async def delete_complex(
        complex_id: int,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(get_current_user),
):
    complex_repo = ComplexRepository(db)
    return await complex_repo.delete_complex(complex_id, firm_id=user.firm_id)

"-------------------------------------------------------------------------------------------"

@router.patch(
    "/{complex_id}/logo",
    response_model=AddComplexResponse,
    dependencies=[Depends(has_permission("update_complexes"))]
)
async def upload_complex_logo(
    complex_id: int,
    image: UploadFile,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    complex_repo = ComplexRepository(db)
    current = await complex_repo.get_complex(complex_id, firm_id=user.firm_id)
    if current.logo_url:
        await delete_image(current.logo_url)
    logo_url = await save_image(image, path="complexes")
    updated = await complex_repo.update_complex(complex_id, firm_id=user.firm_id, logo_url=logo_url)
    return updated
