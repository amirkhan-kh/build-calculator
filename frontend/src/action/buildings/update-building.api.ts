import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import { IBuildings } from "@/types/building.types";
import { SafeObject } from "@/types/safe-response.types";

export async function updateBuilding(
	id: string | number,
	payload: Partial<IBuildings> | FormData,
	params: Record<string, unknown> = {},
): Promise<SafeObject<IBuildings>> {
	const result: SafeObject<IBuildings> = { data: null };
	const searchParams = createSearchParams(params).toString();

	try {
		const auth = await getAuthData();
		if (!auth?.access) {
			result._meta = {
				status: 401,
				error: "Sessiya muddati tugagan",
				reason: "TOKEN",
			};
			return result;
		}

		const isFormData = payload instanceof FormData;

		const res = await fetch(
			`${ENV.PUBLIC_API_URL}/buildings/${id}/${searchParams ? `?${searchParams}` : ""}`,
			{
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${auth.access}`,
					...(isFormData ? {} : { "Content-Type": "application/json" }),
				},
				body: isFormData ? payload : JSON.stringify(payload),
			},
		);

		if (!res.ok) {
			const errorData = (await res.json().catch(() => ({}))) as {
				detail?: string;
			};
			result._meta = {
				status: res.status,
				error:
					typeof errorData.detail === "string"
						? errorData.detail
						: `Xatolik: ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}

		result.data = (await res.json()) as IBuildings;
		return result;
	} catch (error: unknown) {
		result._meta = {
			status: 500,
			error: error instanceof Error ? error.message : "Failed to fetch",
			reason: "UNKNOWN",
		};
		return result;
	}
}
