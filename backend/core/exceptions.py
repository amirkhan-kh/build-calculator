from fastapi import HTTPException


class InvalidToken(HTTPException):
    def __init__(self, detail: str):
        super().__init__(401, detail)


class Forbidden(HTTPException):
    def __init__(self, detail: str):
        super().__init__(403, detail)













