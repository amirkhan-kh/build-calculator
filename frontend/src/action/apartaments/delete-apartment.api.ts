import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { SafeDelete } from "@/types/safe-response.types";

export async function deleteApartment(
	id: string | number,
	params: Record<string, number> = {},
) {
	const result: SafeDelete = { success: false };
	const searchParams = createSearchParams(params).toString();
	try {
		const authData = await getAuthData();
		if (!authData?.access) {
			result._meta = {
				status: 401,
				error: "Avtorizatsiya muddati tugagan",
				reason: "TOKEN",
			};
			return result;
		}
		const res = await fetch(
			`${ENV.PUBLIC_API_URL}/apartments/${id}${searchParams ? `?${searchParams}` : ""}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${authData.access}`,
					"Content-Type": "application/json",
				},
			},
		);
		if (!res.ok) {
			const errorDetail = await res.text().catch(() => "Noma'lum xatolik");
			result._meta = {
				status: res.status,
				error: `O'chirishda xatolik: ${res.status} - ${errorDetail}`,
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
			error: error instanceof Error ? error.message : "Server xatosi",
			reason: "UNKNOWN",
		};
		return result;
	}
}
