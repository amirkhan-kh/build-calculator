import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type {
	ICoefficientType,
	UpdateCoefficientTypePayload,
} from "@/types/coefficient-type.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function updateCoefficientType(
	coefficientTypeId: string | number,
	payload: UpdateCoefficientTypePayload,
	params: Record<string, unknown> = {},
): Promise<SafeObject<ICoefficientType>> {
	const result: SafeObject<ICoefficientType> = { data: null };

	const searchParams = createSearchParams(params).toString();
	try {
		const auth = await getAuthData();
		if (!auth?.access) {
			result._meta = {
				status: 401,
				error: "Срок сессии истек",
				reason: "TOKEN",
			};
			return result;
		}

		const requestBody = {
			name: payload.name,
			rate: String(payload.rate),
			coefficient_id: payload.coefficient_id,
		};

		const res = await fetch(
			`${ENV.PUBLIC_API_URL}/coefficient-types/${coefficientTypeId}/${searchParams ? `?${searchParams}` : ""}`,
			{
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${auth.access}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
				cache: "no-store",
			},
		);

		if (!res.ok) {
			const errorData = (await res.json().catch(() => ({}))) as {
				detail?: string;
			};
			result._meta = {
				status: res.status,
				error: errorData.detail || `Ошибка при обновлении: ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}

		result.data = (await res.json()) as ICoefficientType;
		return result;
	} catch (error: unknown) {
		result._meta = {
			status: 500,
			error: error instanceof Error ? error.message : "Неизвестная ошибка",
			reason: "UNKNOWN",
		};
		return result;
	}
}
