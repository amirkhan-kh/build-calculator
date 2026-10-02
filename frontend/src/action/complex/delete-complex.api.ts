import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { SafeDelete } from "@/types/safe-response.types";

export async function deleteComplex(
	id: string | number,
	params: Record<string, unknown> = {},
): Promise<SafeDelete> {
	const result: SafeDelete = { success: false };

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
			`${ENV.PUBLIC_API_URL}/complexes/${id}/${searchParams ? `?${searchParams}` : ""}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${auth.access}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!res.ok) {
			result._meta = {
				status: res.status,
				error: `Ошибка при удалении: ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}

		result.success = true;
		result._meta = { status: res.status, reason: "HTTP" };
		return result;
	} catch (error: unknown) {
		result._meta = {
			status: 500,
			error: error instanceof Error ? error.message : "Непредвиденная ошибка",
			reason: "UNKNOWN",
		};
		return result;
	}
}
