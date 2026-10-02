import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type {
	IPermission,
	IPermissionFilters,
} from "@/types/permissions.types";
import type { SafeArray } from "@/types/safe-response.types";

export async function getPermissions(
	params: IPermissionFilters,
): Promise<SafeArray<IPermission>> {
	const result: SafeArray<IPermission> = [];
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
			`${ENV.PUBLIC_API_URL}/permissions/${queryStr ? `?${queryStr}` : ""}`,
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
