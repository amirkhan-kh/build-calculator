from complexes.models import Complex
from core.validations import BaseValidator


class BuildingValidator(BaseValidator):
    async def validate_complex_fk(self, complex_fk):
        await super().validate_foreign_key(Complex, complex_fk)













