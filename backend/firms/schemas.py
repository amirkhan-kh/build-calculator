from pydantic import BaseModel


class AddFirmBody(BaseModel):
    name: str
    username: str
    password: str


class UpdateFirmBody(BaseModel):
    name: str | None = None
    username: str | None = None
    password: str | None = None
    is_active: bool | None = None


class FirmResponse(BaseModel):
    id: int
    name: str
    username: str
    password: str
    is_active: bool
