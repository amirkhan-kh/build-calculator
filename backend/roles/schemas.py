from pydantic import BaseModel
from permissions.schemas import PermissionGetResponse


class RoleListResponse(BaseModel):
    id: int
    name: str
    permissions: list[PermissionGetResponse]


class RoleCreateBody(BaseModel):
    name: str
    permission_ids: list[int] | None = None


class RoleCreateResponse(RoleListResponse):
    pass


class RoleGetResponse(RoleListResponse):
    pass


class RoleUpdateBody(BaseModel):
    name: str | None = None
    permission_ids: list[int] | None = None


class RoleUpdateResponse(RoleListResponse):
    pass
