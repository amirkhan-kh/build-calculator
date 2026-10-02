from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.dialects.postgresql import insert

from core.db.base_model import BaseModel
from permissions.models import Permission


async def init_platform_admin(db: AsyncSession):
    import core.models  # noqa: F401
    from auth.services.password_service import PasswordService
    from users.models import User

    existing = await db.execute(select(User).where(User.username == "amir"))
    if existing.scalar_one_or_none() is not None:
        return

    user = User(
        fullname="Amir",
        phone="+998000000000",
        username="amir",
        hashed_password=await PasswordService.hash_password("2211webdev"),
        is_superuser=True,
        is_platform_admin=True,
        firm_id=None,
    )
    db.add(user)
    await db.commit()


async def init_roles(db: AsyncSession):
    from roles.models import Role

    result = await db.execute(select(Permission))
    all_perms = {p.codename: p for p in result.scalars().all()}

    if not all_perms:
        return

    manager_tables = [
        "complexes", "buildings", "apartments",
        "apartment_layouts", "building_coefficients", "building_coefficient_types",
    ]
    manager_codenames = set()
    for table in manager_tables:
        for action in ("create", "view", "update", "delete"):
            manager_codenames.add(f"{action}_{table}")
    manager_codenames.update(["view_users", "view_roles", "view_permissions"])

    default_roles = [
        {
            "name": "Администратор",
            "codenames": list(all_perms.keys()),
        },
        {
            "name": "Менеджер",
            "codenames": [c for c in manager_codenames if c in all_perms],
        },
    ]

    for role_def in default_roles:
        existing = await db.execute(select(Role).where(Role.name == role_def["name"]))
        if existing.scalar_one_or_none() is not None:
            continue

        new_role = Role(name=role_def["name"])
        new_role.permissions.extend(all_perms[c] for c in role_def["codenames"])
        db.add(new_role)

    await db.commit()


async def init_permissions(db: AsyncSession):
    actions = ["create", "view", "update", "delete"]
    tables = BaseModel.metadata.tables.keys()

    values = []

    for table in tables:
        for action in actions:
            values.append(
                {
                    "codename": f"{action}_{table}",
                    "label": f"{action.title()} {table.lower()}",
                }
            )

    custom_permissions = [
        {
            "codename": "assign_permissions",
            "label": "Assign permissions",
        }
    ]

    values.extend(custom_permissions)

    if not values:
        return []

    stmt = insert(Permission).values(values)

    stmt = stmt.on_conflict_do_nothing(
        index_elements=["label"]
    )

    await db.execute(stmt)
    await db.commit()

    result = await db.execute(select(Permission))
    return result.scalars().all()







