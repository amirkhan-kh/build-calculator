import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/configs/env.config";

export async function GET(req: NextRequest) {
    const from = req.nextUrl.searchParams.get("from") || "/complex";
    const refreshToken = req.cookies.get("refresh_token")?.value;

    const loginRedirect = NextResponse.redirect(new URL("/login", req.url));
    loginRedirect.cookies.delete("access_token");
    loginRedirect.cookies.delete("refresh_token");

    if (!refreshToken) {
        return loginRedirect;
    }

    try {
        const res = await fetch(
            `${ENV.PUBLIC_API_URL}/auth/refresh/?refresh_token=${encodeURIComponent(refreshToken)}`,
            { method: "POST", cache: "no-store" },
        );

        if (!res.ok) {
            return loginRedirect;
        }

        const data = await res.json();
        const secureCookie = process.env.SECURE_COOKIES === "true";

        const response = NextResponse.redirect(new URL(from, req.url));

        response.cookies.set("access_token", data.access_token, {
            httpOnly: true,
            sameSite: "lax",
            secure: secureCookie,
            maxAge: 60 * 60 * 24,
            path: "/",
        });

        if (data.refresh_token) {
            response.cookies.set("refresh_token", data.refresh_token, {
                httpOnly: true,
                sameSite: "lax",
                secure: secureCookie,
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
            });
        }

        return response;
    } catch {
        return loginRedirect;
    }
}
