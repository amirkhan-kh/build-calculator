import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { IBuildings } from "@/types/building.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function getBuildingById(
	id: string | number,
	params: Record<string, unknown> = {},
): Promise<SafeObject<IBuildings>> {
	const result: SafeObject<IBuildings> = { data: null };
	const searchParams = createSearchParams(params).toString();
	try {
		const authData = await getAuthData();

		if (!authData?.access) {
			result._meta = {
				status: 401,
				error: "Avtorizatsiya xatosi: Token topilmadi",
				reason: "TOKEN",
			};
			return result;
		}

		const res = await fetch(
			`${ENV.PUBLIC_API_URL}/buildings/${id}/${searchParams ? `?${searchParams}` : ""}`,
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
			const errorData = (await res.json().catch(() => ({}))) as {
				detail?: string;
			};
			result._meta = {
				status: res.status,
				error: errorData.detail || `HTTP xatosi: ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}

		const data = (await res.json()) as IBuildings;
		result.data = data;
		return result;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Kutilmagan server xatosi";
		result._meta = {
			status: 500,
			error: errorMessage,
			reason: "UNKNOWN",
		};
		return result;
	}
}
