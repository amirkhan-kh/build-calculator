import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { IApartment } from "@/types/apartment.types";
import type { SafeObject } from "@/types/safe-response.types";
export async function updateApartment(
	id: string | number,
	payload: Partial<IApartment>,
	params: Record<string, number> = {},
) {
	const result: SafeObject<IApartment> = { data: null };
	const searchParams = createSearchParams(params).toString();
	try {
		const auth = await getAuthData();
		if (!auth?.access) {
			result._meta = {
				status: 401,
				error: "Sessiya muddati tugagan",
				reason: "TOKEN",
			};
			return result;
		}

		const res = await fetch(
			`${ENV.PUBLIC_API_URL}/apartments/${id}/${searchParams ? `?${searchParams}` : ""}`,
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
			const errorText = await res.text();
			console.error("Response error text:", errorText);

			result._meta = {
				status: res.status,
				error: `Xonadonni yangilashda xatolik: ${res.status}. Details: ${errorText}`,
				reason: "HTTP",
			};
			return result;
		}

		const data = await res.json();
		result.data = data as IApartment;
		return result;
	} catch (error) {
		console.error("Full error:", error);
		result._meta = {
			status: 500,
			error: error instanceof Error ? error.message : "Noma'lum xatolik",
			reason: "UNKNOWN",
		};
		return result;
	}
}
