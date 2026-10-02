import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import {
	CreateCoefficientPayload,
	ICoefficient,
} from "@/types/coefficient-type.types";
import { SafeObject } from "@/types/safe-response.types";

export async function createCoefficient(payload: CreateCoefficientPayload) {
	const result: SafeObject<ICoefficient> = { data: null };

	try {
		const auth = await getAuthData();

		if (!auth?.access) {
			result._meta = {
				status: 401,
				error: "Token topilmadi",
				reason: "TOKEN",
			};
			return result;
		}

		const res = await fetch(`${ENV.PUBLIC_API_URL}/coefficients/add/`, {
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
				error: `Koeffitsient yaratishda xato: ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}

		const data = await res.json();
		result.data = data as ICoefficient;
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
