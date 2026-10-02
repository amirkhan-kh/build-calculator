from pydantic import BaseModel


class PermissionListResponse(BaseModel):
    id: int
    codename: str


class PermissionCreateBody(BaseModel):
    codename: str


class PermissionCreateResponse(PermissionListResponse):
    pass


class PermissionGetResponse(PermissionListResponse):
    pass


class PermissionUpdateBody(BaseModel):
    codename: str | None = None


class PermissionUpdateResponse(PermissionListResponse):
    pass
