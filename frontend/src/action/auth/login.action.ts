"use server";

import { ENV } from "@/configs/env.config";
import type { LoginResponse } from "@/types/auth.types";
import { cookies } from "next/headers";

export async function loginAction(formData: FormData): Promise<void> {
	const username = String(formData.get("username") ?? "").trim();
	const password = String(formData.get("password") ?? "").trim();

	if (!username || !password) {
		throw new Error("Пожалуйста, заполните все обязательные поля");
	}

	const body = new URLSearchParams({
		grant_type: "password",
		username,
		password,
	});

	const res = await fetch(`${ENV.PUBLIC_API_URL}/auth/token/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Accept: "application/json",
		},
		body: body.toString(),
		cache: "no-store",
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}) as { detail?: string });
		throw new Error(err.detail ?? "Ошибка авторизации");
	}

	const data: LoginResponse = await res.json();

	if (!data.access_token) {
		throw new Error("Токен не получен");
	}

	const cookieStore = await cookies();

	const secureCookie = process.env.SECURE_COOKIES === "true";

	cookieStore.set("access_token", data.access_token, {
		httpOnly: true,
		sameSite: "lax",
		secure: secureCookie,
		maxAge: 60 * 60 * 24,
		path: "/",
	});

	if (data.refresh_token) {
		cookieStore.set("refresh_token", data.refresh_token, {
			httpOnly: true,
			sameSite: "lax",
			secure: secureCookie,
			maxAge: 60 * 60 * 24 * 7,
			path: "/",
		});
	}
}
