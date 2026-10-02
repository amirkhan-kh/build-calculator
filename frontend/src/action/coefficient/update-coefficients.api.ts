import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { ICoefficient } from "@/types/coefficient-type.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function updateCoefficient(
	id: string | number,
	payload: Partial<ICoefficient>,
	params: Record<string, unknown> = {},
): Promise<SafeObject<ICoefficient>> {
	const result: SafeObject<ICoefficient> = { data: null };

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

		const res = await fetch(
			`${ENV.PUBLIC_API_URL}/coefficients/${id}/${searchParams ? `?${searchParams}` : ""}`,
			{
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${auth.access}`,
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
				error:
					errorData.detail ||
					`Ошибка при обновлении коэффициента: ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}

		result.data = (await res.json()) as ICoefficient;
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
