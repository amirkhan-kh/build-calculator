import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { IComplex } from "@/types/complex.types";
import type { ComplexArray } from "@/types/safe-response.types";

export async function getComplexes(params: Record<string, unknown> = {}) {
	const result: ComplexArray = [];

	const searchParams = createSearchParams(params).toString();
	try {
		const auth = await getAuthData();

		if (!auth?.access) {
			result._meta = {
				status: 401,
				error: "Ошибка авторизации: Токен не найден",
				reason: "TOKEN",
			};
			return result;
		}

		const response = await fetch(
			`${ENV.PUBLIC_API_URL}/complexes/${searchParams ? `?${searchParams}` : ""}`,
			{
				headers: {
					Authorization: `Bearer ${auth.access}`,
					"Content-Type": "application/json",
				},
				cache: "no-store",
			},
		);

		if (!response.ok) {
			result._meta = {
				status: response.status,
				error: `Ошибка HTTP: ${response.status}`,
				reason: "HTTP",
			};
			return result;
		}

		const data = await response.json();

		// API formatiga qarab tekshiramiz (massiv yoki results ichida)
		const items = Array.isArray(data) ? data : data?.results;

		if (Array.isArray(items)) {
			return items as IComplex[];
		}

		result._meta = {
			status: response.status,
			error: "Неизвестный формат ответа",
			reason: "UNKNOWN",
		};
		return result;
	} catch (error: unknown) {
		result._meta = {
			status: 500,
			error:
				error instanceof Error
					? error.message
					: "Непредвиденная ошибка сервера",
			reason: "UNKNOWN",
		};
		return result;
	}
}
