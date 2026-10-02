import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { IBuildings } from "@/types/building.types";
import type { SafeArray } from "@/types/safe-response.types";

export async function getBuildings(params: {
	search?: string;
	page?: number;
	category?: string;
	limit?: number;
	offset?: number;
	complex_id?: string | number;
}) {
	const result: SafeArray<IBuildings> = [];
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
			`${ENV.PUBLIC_API_URL}/buildings/${queryStr ? `?${queryStr}` : ""}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${authData.access}`,
					"Content-Type": "application/json",
					Accept: "application/json",
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
		let data: unknown;
		try {
			data = await res.json();
		} catch {
			result._meta = {
				status: res.status,
				error: "Invalid JSON response",
				reason: "PARSE",
			};
			return result;
		}

		if (Array.isArray(data)) {
			return data;
		}
		result._meta = {
			status: res.status,
			error: "Unknown response format",
			reason: "UNKNOWN",
		};
		return result;
	} catch {
		result._meta = {
			status: 500,
			error: "Unexpected server error",
			reason: "UNKNOWN",
		};
		return result;
	}
}
