import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { IUserMe } from "@/types/auth.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function getAuthMe(): Promise<SafeObject<IUserMe>> {
	const result: SafeObject<IUserMe> = { data: null };

	try {
		const auth = await getAuthData();
		if (!auth?.access) {
			result._meta = {
				status: 401,
				error: "Avtorizatsiya zarur",
				reason: "TOKEN",
			};
			return result;
		}

		const res = await fetch(`${ENV.PUBLIC_API_URL}/auth/me`, {
			headers: { Authorization: `Bearer ${auth.access}` },
			cache: "no-store",
		});

		const data = await res.json();
		if (!res.ok) {
			result._meta = {
				status: res.status,
				error: data?.detail,
				reason: "HTTP",
			};
			return result;
		}

		result.data = data as IUserMe;
		result._meta = { status: 200, reason: "HTTP" };
		return result;
	} catch (error) {
		result._meta = {
			status: 500,
			error: "Noma'lum xato",
			reason: "UNKNOWN",
		};
		return result;
	}
}
