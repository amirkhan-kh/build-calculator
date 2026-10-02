import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { SafeArray } from "@/types/safe-response.types";
import type { IRole, IRoleFilters } from "@/types/role.types";

export async function getRoles(
	params: IRoleFilters,
): Promise<SafeArray<IRole>> {
	const result: SafeArray<IRole> = [];
	const queryStr = createSearchParams(params).toString();

	try {
		const authData = await getAuthData();
		if (!authData?.access) {
			result._meta = {
				status: 401,
				error: "Unauthorized token",
				reason: "TOKEN",
			};
			return result;
		}

		const res = await fetch(
			`${ENV.PUBLIC_API_URL}/roles/${queryStr ? `?${queryStr}` : ""}`,
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
			result._meta = {
				status: res.status,
				error: `HTTP error ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}

		const data = await res.json();
		return Array.isArray(data) ? data : result;
	} catch {
		result._meta = {
			status: 500,
			error: "Unexpected server error",
			reason: "UNKNOWN",
		};
		return result;
	}
}
