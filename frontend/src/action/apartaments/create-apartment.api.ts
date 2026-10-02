import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { IApartment } from "@/types/apartment.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function createApartment(
	payload: Partial<IApartment>,
	params: Record<string, unknown> = {},
) {
	const result: SafeObject<IApartment> = { data: null };

	const searchParams = createSearchParams(params).toString();

	try {
		const authData = await getAuthData();

		if (!authData?.access) {
			result._meta = {
				status: 401,
				error: "Ошибка авторизации: Токен не найден",
				reason: "TOKEN",
			};
			return result;
		}

		const res = await fetch(
			`${ENV.PUBLIC_API_URL}/apartments/add/${searchParams ? `?${searchParams}` : ""}`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${authData.access}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			},
		);

		if (!res.ok) {
			const errorData = (await res.json().catch(() => ({}))) as {
				detail?: string;
			};
			result._meta = {
				status: res.status,
				error: errorData?.detail || `Ошибка при создании: ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}

		result.data = (await res.json()) as IApartment;
		return result;
	} catch (error: unknown) {
		result._meta = {
			status: 500,
			error:
				error instanceof Error ? error.message : "Неизвестная ошибка сервера",
			reason: "UNKNOWN",
		};
		return result;
	}
}
