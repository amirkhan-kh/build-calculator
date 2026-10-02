import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { ICoefficientTypeGroup } from "@/types/coefficient-type.types";
import type { SafeArray } from "@/types/safe-response.types";

export async function getCoefficientTypesByBuildingId(
	buildingId: number | string,
	params: Record<string, unknown> = {},
): Promise<SafeArray<ICoefficientTypeGroup>> {
	const result: SafeArray<ICoefficientTypeGroup> = [];

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
			`${ENV.PUBLIC_API_URL}/coefficients-common/bcs-with-bcts-by-building-id/${buildingId}/${
				searchParams ? `?${searchParams}` : ""
			}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${authData.access}`,
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
			return data as ICoefficientTypeGroup[];
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
