import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { IComplex } from "@/types/complex.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function getComplexById(
	id: string | number,
	params: Record<string, unknown> = {},
): Promise<SafeObject<IComplex>> {
	const result: SafeObject<IComplex> = { data: null };

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
			`${ENV.PUBLIC_API_URL}/complexes/${id}/${searchParams ? `?${searchParams}` : ""}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${authData.access}`,
					"Content-Type": "application/json",
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
				error: errorData?.detail || `Ошибка HTTP: ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}

		result.data = (await res.json()) as IComplex;
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
