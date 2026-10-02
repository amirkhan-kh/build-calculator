from pydantic import BaseModel


class UserListResponse(BaseModel):
    id: int
    fullname: str
    phone: str | None
    username: str
    role_id: int | None


class UserCreateBody(BaseModel):
    fullname: str
    phone: str | None = None
    username: str
    password: str
    role_id: int | None = None


class UserCreateResponse(UserListResponse):
    pass


class UserGetResponse(UserListResponse):
    pass


class UserUpdateBody(BaseModel):
    fullname: str | None = None
    phone: str | None = None
    username: str | None = None
    role_id: int | None = None


class UserUpdateResponse(UserListResponse):
    pass










