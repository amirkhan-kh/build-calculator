


from fastapi import Query

def pagination(
    limit: int = Query(15, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    return {"limit": limit, "offset": offset}







