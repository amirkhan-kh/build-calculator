from starlette.routing import Match, Router
from starlette.types import ASGIApp, Receive, Scope, Send


class TrailingSlashMiddleware:
    """Proxy (masalan, Vercel rewrite) yo'l oxiridagi "/" ni qo'shishi yoki olib tashlashi
    mumkin. Redirect o'rniga mos keladigan route'ga ichkarida yo'naltiramiz."""

    def __init__(self, app: ASGIApp, router: Router):
        self.app = app
        self.router = router

    def _matches(self, scope: Scope) -> bool:
        return any(route.matches(scope)[0] != Match.NONE for route in self.router.routes)

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] == "http":
            path = scope["path"]
            if path != "/" and not self._matches(scope):
                alt = path[:-1] if path.endswith("/") else f"{path}/"
                alt_scope = {**scope, "path": alt, "raw_path": alt.encode()}
                if self._matches(alt_scope):
                    scope = alt_scope
        await self.app(scope, receive, send)
