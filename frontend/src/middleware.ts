import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/complex", "/buildings", "/apartments", "/calculator-system", "/management"];
const AUTH_ROUTES = ["/login"];

function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(
            atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
        );
        return !payload.exp || Date.now() / 1000 > payload.exp;
    } catch {
        return true;
    }
}

export function middleware(req: NextRequest) {
    const accessToken = req.cookies.get("access_token")?.value;
    const refreshToken = req.cookies.get("refresh_token")?.value;
    const { pathname } = req.nextUrl;

    const isProtected = PROTECTED_ROUTES.some((p) => pathname.startsWith(p));
    const isAuthPage = AUTH_ROUTES.includes(pathname);

    if (isProtected) {
        const accessValid = accessToken && !isTokenExpired(accessToken);

        if (!accessValid) {
            if (refreshToken && !isTokenExpired(refreshToken)) {
                const refreshUrl = new URL("/api/auth/refresh", req.url);
                refreshUrl.searchParams.set("from", pathname);
                return NextResponse.redirect(refreshUrl);
            }
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    if (isAuthPage && accessToken && !isTokenExpired(accessToken)) {
        return NextResponse.redirect(new URL("/complex", req.url));
    }

    return NextResponse.next();
}

export const config = {
	matcher: ["/complex/:path*", "/buildings/:path*", "/apartments/:path*", "/calculator-system/:path*", "/management/:path*", "/login"],
};
