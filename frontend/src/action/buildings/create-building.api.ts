import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { IBuildings } from "@/types/building.types";
import type { SafeObject } from "@/types/safe-response.types";
export async function createBuilding(payload: Partial<IBuildings>) {
	const result: SafeObject<IBuildings> = { data: null };
	try {
		const auth = await getAuthData();

		if (!auth?.access) {
			result._meta = {
				status: 401,
				error: "Avtorizatsiya xatosi: Token topilmadi",
				reason: "TOKEN",
			};
			return result;
		}
		const res = await fetch(`${ENV.PUBLIC_API_URL}/buildings/add/`, {
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
				error: `Binoni yaratib bo'lmadi: ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}

		const data = await res.json();
		result.data = data as IBuildings;
		return result;
	} catch (error) {
		result._meta = {
			status: 500,
			error: error instanceof Error ? error.message : "Noma'lum xatolik",
			reason: "UNKNOWN",
		};
		return result;
	}
}
