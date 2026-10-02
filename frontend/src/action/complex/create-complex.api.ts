import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { IComplex } from "@/types/complex.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function createComplex(payload: Partial<IComplex>) {
	const result: SafeObject<IComplex> = { data: null };

	try {
		const auth = await getAuthData();

		if (!auth?.access) {
			result._meta = {
				status: 401,
				error: "Unauthorized token",
				reason: "TOKEN",
			};
			return result;
		}

		const res = await fetch(`${ENV.PUBLIC_API_URL}/complexes/add/`, {
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
				error: "HTTP error",
				reason: "HTTP",
			};
			return result;
		}

		const data = await res.json();
		result.data = data as IComplex;
		return result;
	} catch (error) {
		result._meta = {
			status: 500,
			error: error instanceof Error ? error.message : "Server error",
			reason: "UNKNOWN",
		};
		return result;
	}
}
