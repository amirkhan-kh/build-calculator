import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { ICoefficient } from "@/types/coefficient-type.types";
import type { SafeArrayGetCoefficient } from "@/types/safe-response.types";

export async function getCoefficients(params: Record<string, unknown> = {}) {
	const result: SafeArrayGetCoefficient<ICoefficient> = { data: [] };
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
			`${ENV.PUBLIC_API_URL}/coefficients/${searchParams ? `?${searchParams}` : ""}`,
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
			result._meta = {
				status: res.status,
				error: `Ошибка HTTP: ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}

		const data = await res.json();

		if (Array.isArray(data)) {
			result.data = data as ICoefficient[];
			return result;
		}

		if (
			data &&
			typeof data === "object" &&
			"results" in data &&
			Array.isArray(data.results)
		) {
			result.data = data.results as ICoefficient[];
			return result;
		}

		result._meta = {
			status: res.status,
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
