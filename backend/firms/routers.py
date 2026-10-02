from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.db.session import get_db
from firms.access import require_platform_admin
from firms.filters import FirmFilter
from firms.repositories import FirmRepository
from firms.schemas import AddFirmBody, FirmResponse, UpdateFirmBody

router = APIRouter(prefix="/firms", tags=["Firms"])


@router.get(
    "/",
    response_model=list[FirmResponse],
    dependencies=[Depends(require_platform_admin)],
)
async def get_firm_list(
    db: AsyncSession = Depends(get_db),
    filters: FirmFilter = Depends(),
):
    firm_repo = FirmRepository(db)
    return await firm_repo.get_firm_list(filters)


@router.get(
    "/count/",
    dependencies=[Depends(require_platform_admin)],
)
async def get_firm_count(
    db: AsyncSession = Depends(get_db),
    filters: FirmFilter = Depends(),
):
    firm_repo = FirmRepository(db)
    return {"count": await firm_repo.get_firm_count(filters)}


@router.post(
    "/add/",
    response_model=FirmResponse,
    dependencies=[Depends(require_platform_admin)],
)
async def add_firm(create_firm: AddFirmBody, db: AsyncSession = Depends(get_db)):
    firm_repo = FirmRepository(db)
    return await firm_repo.create_firm(**create_firm.model_dump())


@router.get(
    "/{firm_id}/",
    response_model=FirmResponse,
    dependencies=[Depends(require_platform_admin)],
)
async def get_firm(firm_id: int, db: AsyncSession = Depends(get_db)):
    firm_repo = FirmRepository(db)
    return await firm_repo.get_firm(firm_id)


@router.patch(
    "/{firm_id}/",
    response_model=FirmResponse,
    dependencies=[Depends(require_platform_admin)],
)
async def edit_firm(
    firm_id: int,
    update_firm: UpdateFirmBody,
    db: AsyncSession = Depends(get_db),
):
    firm_repo = FirmRepository(db)
    return await firm_repo.update_firm(
        firm_id, **update_firm.model_dump(exclude_unset=True)
    )
