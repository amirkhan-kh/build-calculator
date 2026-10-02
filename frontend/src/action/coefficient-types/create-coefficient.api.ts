import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { ICoefficientType } from "@/types/coefficient-type.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function createCoefficientType(
	payload: Partial<ICoefficientType>,
) {
	const result: SafeObject<ICoefficientType> = { data: null };

	try {
		const auth = await getAuthData();

		if (!auth?.access) {
			result._meta = {
				status: 401,
				error: "Avtorizatsiya muddati tugagan",
				reason: "TOKEN",
			};
			return result;
		}

		const res = await fetch(`${ENV.PUBLIC_API_URL}/coefficient-types/add/`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${auth.access}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			result._meta = {
				status: res.status,
				error: `Turi yaratishda xatolik: ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}

		const data = await res.json();
		result.data = data as ICoefficientType;
		return result;
	} catch (error) {
		result._meta = {
			status: 500,
			error: error instanceof Error ? error.message : "Server xatosi",
			reason: "UNKNOWN",
		};
		return result;
	}
}
