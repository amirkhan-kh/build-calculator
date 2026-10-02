from pydantic import BaseModel, ConfigDict


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class GetMe(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    fullname: str
    phone: str
    username: str
    is_platform_admin: bool = False
    is_superuser: bool = False
    firm_id: int | None = None


