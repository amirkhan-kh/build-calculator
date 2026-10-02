import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { IBuildings } from "@/types/building.types";
import type { SafeArray } from "@/types/safe-response.types";

export async function getBuildingsByComplexId(
	complexId: string | number,
	extraParams: Record<string, number> = {},
) {
	const result: SafeArray<IBuildings> = [];
	const params = {
		complex_id: complexId,
		...extraParams,
	};
	const searchParams = createSearchParams(params).toString();
	try {
		const authData = await getAuthData();
		if (!authData?.access) {
			result._meta = {
				status: 401,
				error: "Token topilmadi",
				reason: "TOKEN",
			};
			return result;
		}

		const res = await fetch(
			`${ENV.PUBLIC_API_URL}/buildings/${searchParams ? `?${searchParams}` : ""}`,
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
				error: "Server xatosi",
				reason: "HTTP",
			};
			return result;
		}

		const json = await res.json();
		const data = Array.isArray(json) ? json : json?.results || json?.data;

		if (Array.isArray(data)) {
			return data as IBuildings[];
		}

		result._meta = {
			status: 200,
			error: "Noto'g'ri format",
			reason: "PARSE",
		};
		return result;
	} catch (error) {
		result._meta = {
			status: 500,
			error: error instanceof Error ? error.message : "Noma'lum xato",
			reason: "UNKNOWN",
		};
		return result;
	}
}
