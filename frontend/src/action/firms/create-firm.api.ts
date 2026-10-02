import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { IFirm } from "@/types/firm.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function createFirm(payload: {
	name: string;
	username: string;
	password: string;
}): Promise<SafeObject<IFirm>> {
	const result: SafeObject<IFirm> = { data: null };

	try {
		const auth = await getAuthData();
		if (!auth?.access) {
			result._meta = { status: 401, error: "Unauthorized", reason: "TOKEN" };
			return result;
		}

		const res = await fetch(`${ENV.PUBLIC_API_URL}/firms/add/`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${auth.access}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			result._meta = {
				status: res.status,
				error: (err as { detail?: string }).detail || "HTTP error",
				reason: "HTTP",
			};
			return result;
		}

		result.data = (await res.json()) as IFirm;
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
