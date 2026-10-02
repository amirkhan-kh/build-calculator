from fastapi import HTTPException, UploadFile
from sqlalchemy import select
from starlette import status

from buildings.models import Building
from coefficients.models import BuildingCoefficientType
from buildings.repositories import BuildingRepository
from core.config import MAX_FILE_SIZE
from core.validations import BaseValidator


class ApartmentValidator(BaseValidator):
    async def validate_apartment_create(self, **kwargs):
        building_id = kwargs.get('building_id')
        if building_id:
            await self.validate_building_fk(building_id)

        floor = kwargs.get('floor')
        if floor:
            await self._validate_floor(building_id, floor)

        bct_ids = kwargs.get("bct_ids")
        if bct_ids:
            await self._validate_bct_ids(building_id, bct_ids)

    async def validate_apartment_update(self, **kwargs):
        building_id = kwargs.get('building_id')
        if building_id:
            await self.validate_building_fk(building_id)

        floor = kwargs.get('floor')
        if floor:
            await self._validate_floor(building_id, floor)

        bct_ids = kwargs.get("bct_ids")
        if bct_ids:
            await self._validate_bct_ids(kwargs.get("building_id"), bct_ids)

    async def _validate_bct_ids(self, building_id: int, bct_ids: list[int]):
        for bct_id in bct_ids:
            await self.validate_foreign_key(BuildingCoefficientType, bct_id)

        building_repository = BuildingRepository(self.db)
        building = await building_repository.get_building(building_id)

        actual_bct_ids = []
        for bc in building.building_coefficients:
            for bct in bc.building_coefficient_types:
                actual_bct_ids.append(bct.id)

        if not set(bct_ids).issubset(set(actual_bct_ids)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Некоторые коэффициенты здания не относятся к данному зданию."
            )

        await self._validate_bct_ids_does_not_belong_to_the_same_bc(bct_ids)


    async def _validate_bct_ids_does_not_belong_to_the_same_bc(self, bct_ids: list[int]):
        bcts_stmt = await self.db.execute(
            select(BuildingCoefficientType)
            .where(BuildingCoefficientType.id.in_(bct_ids))
        )
        bcts = bcts_stmt.scalars().all()

        bc_ids = []
        for bct in bcts:
            bc_id = bct.building_coefficient.id
            if bc_id in bc_ids:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Для каждого коэффициента здания можно выбрать один тип коэффициента здания!")
            bc_ids.append(bct.building_coefficient.id)

    async def _validate_floor(self, building_id: int, floor: int):
        building_repository = BuildingRepository(self.db)
        building = await building_repository.get_building(building_id)
        floor_count = building.floor_count

        if floor > floor_count:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Расположение квартиры на этом этаже ({floor}) не может превышать количество этажей в здании ({floor_count})."
            )


class ApartmentBulkCreateValidator(BaseValidator):
    @staticmethod
    async def validate_file_type(upload_file: UploadFile):
        # print(upload_file.file)
        # print(upload_file.filename)
        # print(type(upload_file.filename))
        # print(upload_file.size)
        # print(upload_file.headers)
        # print(upload_file.content_type)
        filename = upload_file.filename
        if not filename or not filename.lower().endswith((".xls", ".xlsx")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Введите допустимый тип файла (.xls или .xlsx)"
            )

    @staticmethod
    async def validate_file_size(size: int):
        if size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Файл пуст"
            )

        if size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Файл слишком большой"
            )



    async def validate_fields(self, building_id: int, column_names: list[str]):
        building = await self._validate_building_id(building_id)
        await self._validate_column_length(column_length=len(column_names))
        await self._validate_main_fields(main_field_column_names=column_names[:4])

        building_coefficient_names = [obj.name for obj in building.building_coefficients]
        await self._validate_building_coefficients(
            building_coefficient_names=building_coefficient_names,
            bc_column_names=column_names[4:]
        )

    async def _validate_building_id(self, building_id: int):
        if building_id <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="FK не может быть отрицательным.")

        building = (await self.db.execute(select(Building).where(Building.id == building_id))).scalar_one_or_none()
        if not building:
            raise HTTPException(status_code=404,
                                detail=f"{Building.__name__} с идентификатором {building_id} не найдена.")
        return building

    @staticmethod
    async def _validate_column_length(column_length: int):
        if column_length < 4:
            raise HTTPException(status_code=400, detail="Недостаточно столбцов :(")

    @staticmethod
    async def _validate_main_fields(main_field_column_names: list[str]):
        apartment_fields = ["number", "floor", "area", "room_count"]
        if sorted(apartment_fields) != sorted(main_field_column_names):
            raise HTTPException(status_code=400, detail="Первые 4 столбца неверно названы")

    @staticmethod
    async def _validate_building_coefficients(building_coefficient_names: list[str], bc_column_names: list[str]):
        if sorted(building_coefficient_names) != sorted(bc_column_names):
            raise HTTPException(
                status_code=404,
                detail="Неправильные коэффиценты. Проверьте коэффиценты и попробуйте снова."
            )



