import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { SafeDelete } from "@/types/safe-response.types";

export async function deleteBuilding(
	id: string | number,
	params: Record<string, number> = {},
) {
	const result: SafeDelete = { success: false };
	const searchParams = createSearchParams(params).toString();
	try {
		const auth = await getAuthData();
		if (!auth?.access) {
			result._meta = {
				status: 401,
				error: "Avtorizatsiya xatosi",
				reason: "TOKEN",
			};
			return result;
		}
		const res = await fetch(
			`${ENV.PUBLIC_API_URL}/buildings/${id}/${searchParams ? `?${searchParams}` : ""}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${auth.access}`,
					"Content-Type": "application/json",
				},
			},
		);
		if (!res.ok) {
			result._meta = {
				status: res.status,
				error: `Xatolik: ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}
		result.success = true;
		result._meta = { status: res.status, reason: "HTTP" };
		return result;
	} catch (error) {
		result._meta = {
			status: 500,
			error: "Noma'lum xatolik",
			reason: "UNKNOWN",
		};
		return result;
	}
}
