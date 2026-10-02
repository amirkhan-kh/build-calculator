"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ENV } from "@/configs/env.config";

function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(
            Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
        );
        return !payload.exp || Date.now() / 1000 > payload.exp;
    } catch {
        return true;
    }
}

async function attemptRefresh(refreshToken: string): Promise<string | null> {
    try {
        const res = await fetch(
            `${ENV.PUBLIC_API_URL}/auth/refresh/?refresh_token=${encodeURIComponent(refreshToken)}`,
            { method: "POST", cache: "no-store" },
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data.access_token ?? null;
    } catch {
        return null;
    }
}

export async function getAuthData() {
    const cookieStore = await cookies();
    const access = cookieStore.get("access_token")?.value;
    const refresh = cookieStore.get("refresh_token")?.value;

    if (!access) {
        redirect("/login");
    }

    if (!isTokenExpired(access)) {
        return { access, refresh: refresh ?? null };
    }

    // Access token expired — try to refresh
    if (!refresh || isTokenExpired(refresh)) {
        cookieStore.delete("access_token");
        cookieStore.delete("refresh_token");
        redirect("/login");
    }

    const newAccess = await attemptRefresh(refresh);

    if (!newAccess) {
        cookieStore.delete("access_token");
        cookieStore.delete("refresh_token");
        redirect("/login");
    }

    const secureCookie = process.env.SECURE_COOKIES === "true";
    cookieStore.set("access_token", newAccess, {
        httpOnly: true,
        sameSite: "lax",
        secure: secureCookie,
        maxAge: 60 * 60 * 24,
        path: "/",
    });

    return { access: newAccess, refresh };
}
