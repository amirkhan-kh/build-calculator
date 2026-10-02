from decimal import Decimal
from io import BytesIO
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm.attributes import set_committed_value
from starlette import status

import pandas as pd
from starlette.responses import JSONResponse, StreamingResponse

from apartments.filters import ApartmentFilter
from apartments.managers import ApartmentManager
from apartments.models import Apartment
from apartments.schemas import AddApartmentResponse, AddApartmentBody, UpdateApartmentBody
from apartments.services import recalculate_final_price
from apartments.validations import ApartmentBulkCreateValidator
from auth.dependencies import get_current_user, has_permission
from buildings.models import Building
from coefficients.models import BuildingCoefficientType, BuildingCoefficient
from core.db.session import get_db
from core.dependencies import pagination
from layouts.repositories import LayoutRepository
from users.models import User

router = APIRouter(prefix="/apartments", tags=["Apartments"])

"-------------------------------------------------------------------------------------------"

@router.get(
    "/",
    response_model=list[AddApartmentResponse],
    dependencies=[Depends(has_permission("view_apartments"))]
)
async def get_apartment_list(
        db: AsyncSession = Depends(get_db),
        filters: ApartmentFilter = Depends(),
        page: dict = Depends(pagination),
        user: User = Depends(get_current_user),
):
    apartment_manager = ApartmentManager(db)
    return await apartment_manager.get_apartment_list(filters, page, firm_id=user.firm_id)

"-------------------------------------------------------------------------------------------"

@router.post(
    "/add/",
    response_model=AddApartmentResponse,
    dependencies=[Depends(has_permission("create_apartments"))]
)
async def add_apartment(create_apartment: AddApartmentBody, db: AsyncSession = Depends(get_db)):
    apartment_manager = ApartmentManager(db)
    return await apartment_manager.create_apartment(**create_apartment.model_dump())

"-------------------------------------------------------------------------------------------"

@router.get("/template/", dependencies=[Depends(has_permission("create_apartments"))])
async def download_apartment_template(building_id: int, db: AsyncSession = Depends(get_db)):
    building = (await db.execute(
        select(Building).where(Building.id == building_id)
    )).scalar_one_or_none()
    if not building:
        raise HTTPException(status_code=404, detail="Здание не найдено")

    main_cols = ["number", "floor", "area", "room_count"]
    coeff_cols = [bc.name for bc in building.building_coefficients]
    all_cols = main_cols + coeff_cols

    example_row = ["101", 1, 45.5, 2]
    for bc in building.building_coefficients:
        first_type = bc.building_coefficient_types[0].name if bc.building_coefficient_types else ""
        example_row.append(first_type)

    df = pd.DataFrame([example_row], columns=all_cols)

    ref_data: dict[str, list] = {}
    for bc in building.building_coefficients:
        ref_data[bc.name] = [bct.name for bct in bc.building_coefficient_types]

    output = BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Квартиры")
        if ref_data:
            max_len = max(len(v) for v in ref_data.values())
            ref_rows = {k: v + [""] * (max_len - len(v)) for k, v in ref_data.items()}
            pd.DataFrame(ref_rows).to_excel(writer, index=False, sheet_name="Допустимые значения")

    output.seek(0)
    encoded_name = quote(f"template_{building.name}.xlsx")
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=\"template.xlsx\"; filename*=UTF-8''{encoded_name}"},
    )

"-------------------------------------------------------------------------------------------"

@router.get(
    "/{apartment_id}/",
    response_model=AddApartmentResponse,
    dependencies=[Depends(has_permission("view_apartments"))]
)
async def get_apartment(apartment_id: int, db: AsyncSession = Depends(get_db)):
    apartment_manager = ApartmentManager(db)
    return await apartment_manager.get_apartment(apartment_id)

"-------------------------------------------------------------------------------------------"

@router.patch(
    "/{apartment_id}/",
    response_model=AddApartmentResponse,
    dependencies=[Depends(has_permission("update_apartments"))]
)
async def edit_apartment(apartment_id: int, update_apartment: UpdateApartmentBody, db: AsyncSession = Depends(get_db)):
    apartment_manager = ApartmentManager(db)
    return await apartment_manager.update_apartment(apartment_id, **update_apartment.model_dump())

"-------------------------------------------------------------------------------------------"

@router.delete(
    "/{apartment_id}/",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(has_permission("delete_apartments"))]
)
async def delete_apartment(apartment_id: int, db: AsyncSession = Depends(get_db)):
    apartment_manager = ApartmentManager(db)
    return await apartment_manager.delete_apartment(apartment_id)


@router.post("/bulk-create/", dependencies=[Depends(has_permission("create_apartments"))])
async def bulk_create_apartments(building_id: int, excel_file: UploadFile, db: AsyncSession = Depends(get_db)):
    apartment_validator = ApartmentBulkCreateValidator(db)
    await apartment_validator.validate_file_type(excel_file)

    content = await excel_file.read()
    await apartment_validator.validate_file_size(len(content))

    df = pd.read_excel(BytesIO(content))
    column_names = df.columns.values.tolist()

    await apartment_validator.validate_fields(
        building_id=building_id,
        column_names=column_names
    )

    building_bcts = (await db.execute(
        select(BuildingCoefficientType)
        .join(BuildingCoefficientType.building_coefficient)
        .where(BuildingCoefficient.building_id == building_id)
    )).scalars().all()
    bct_dict = {bct.name: bct for bct in building_bcts}

    layout_repo = LayoutRepository(db)
    errors = []
    apartments = []

    for row_index, row in df.iterrows():
        excel_row = int(row_index) + 2

        try:
            number = str(row["number"])
            floor = int(row["floor"])
            area = Decimal(str(row["area"]))
            room_count = int(row["room_count"])
        except Exception:
            errors.append(f"Строка {excel_row}: неверный тип данных в основных полях")
            continue

        bct_ids = []
        row_ok = True
        for bc_name in column_names[4:]:
            val = row[bc_name]
            if pd.isna(val) or not str(val).strip():
                errors.append(f"Строка {excel_row}: пустое значение в колонке «{bc_name}»")
                row_ok = False
                break

            bct_obj = bct_dict.get(str(val).strip())
            if not bct_obj:
                errors.append(f"Строка {excel_row}: недопустимое значение «{val}» в колонке «{bc_name}»")
                row_ok = False
                break

            bct_ids.append(bct_obj.id)

        if not row_ok:
            continue

        new_apartment = Apartment(
            building_id=building_id,
            number=number,
            floor=floor,
            area=area,
            room_count=room_count,
        )
        db.add(new_apartment)
        apartments.append((new_apartment, bct_ids, area))

    await db.flush()

    for apartment, bct_ids, area in apartments:
        set_committed_value(apartment, "building_coefficient_types", [])
        for bct_id in bct_ids:
            bct_obj = await db.get(BuildingCoefficientType, bct_id)
            apartment.building_coefficient_types.append(bct_obj)

        apartment.final_price = await recalculate_final_price(
            db=db,
            building_id=building_id,
            bct_ids=bct_ids,
        )

        existing = await layout_repo.find_matching(building_id, apartment.room_count, area)
        if not existing:
            auto_name = f"{apartment.room_count}-комн. {area}м²"
            try:
                async with db.begin_nested():
                    await layout_repo.create_layout(
                        building_id=building_id,
                        room_count=apartment.room_count,
                        area=area,
                        name=auto_name,
                    )
            except IntegrityError:
                pass

    await db.commit()

    if errors:
        return JSONResponse(status_code=207, content={"errors": errors})

    return {"detail": "success"}
