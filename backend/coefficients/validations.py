from coefficients.models import BuildingCoefficient
from core.validations import BaseValidator


class BuildingCoefficientValidator(BaseValidator):
    pass

class BuildingCoefficientTypeValidator(BaseValidator):
    async def validate_coefficient_fk(self, coefficient_id):
        await self.validate_foreign_key(BuildingCoefficient, coefficient_id)



