from complexes.routers import router as complex_router
from buildings.routers import router as building_router
from apartments.routers import router as apartment_router
from coefficients.routers import coefficients_router, coefficient_types_router, \
    coefficients_common_router
from auth.routers import router as auth_router
from users.routers import router as users_router
from roles.routers import router as roles_router
from permissions.routers import router as permissions_router
from calculator.routers import router as calculator_router
from layouts.routers import router as layout_router
from firms.routers import router as firms_router


routers = [
    firms_router,
    layout_router,
    calculator_router,
    coefficients_common_router,
    auth_router,
    complex_router,
    building_router,
    apartment_router,
    coefficients_router,
    coefficient_types_router,
    users_router,
    roles_router,
    permissions_router,
]

