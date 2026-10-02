import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { ICoefficientType } from "@/types/coefficient-type.types";
import type { SafeArrayGetCoefficient } from "@/types/safe-response.types";

export async function getCoefficientTypes(
	params: Record<string, unknown> = {},
) {
	const result: SafeArrayGetCoefficient<ICoefficientType> = { data: [] };
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

		const res = await fetch(
			`${ENV.PUBLIC_API_URL}/coefficient-types/${searchParams ? `?${searchParams}` : ""}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${auth.access}`,
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				cache: "no-store",
			},
		);

		if (!res.ok) {
			const errorData = (await res.json().catch(() => ({}))) as {
				detail?: string;
			};
			result._meta = {
				status: res.status,
				error: errorData.detail || `Ошибка HTTP: ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}

		const data = await res.json();

		// Pagination holatini ham hisobga olamiz (results ichida bo'lsa)
		const items = Array.isArray(data) ? data : data?.results;

		if (Array.isArray(items)) {
			result.data = items as ICoefficientType[];
			return result;
		}

		result._meta = {
			status: res.status,
			error: "Неизвестный формат ответа",
			reason: "UNKNOWN",
		};
		return result;
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : "Непредвиденная ошибка сервера";
		result._meta = {
			status: 500,
			error: errorMessage,
			reason: "UNKNOWN",
		};
		return result;
	}
}
