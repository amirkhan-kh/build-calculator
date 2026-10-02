import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { SafeDelete } from "@/types/safe-response.types";

export async function deleteCoefficient(
	id: string | number,
	params: Record<string, unknown> = {},
): Promise<SafeDelete> {
	const result: SafeDelete = { success: false };
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
			`${ENV.PUBLIC_API_URL}/coefficients/${id}/${searchParams ? `?${searchParams}` : ""}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${authData.access}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!res.ok) {
			result._meta = {
				status: res.status,
				error: `Koeffitsientni o'chirishda xato: ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}

		result.success = true;
		result._meta = { status: res.status, reason: "HTTP" };
		return result;
	} catch (error: unknown) {
		result._meta = {
			status: 500,
			error: error instanceof Error ? error.message : "Server xatosi",
			reason: "UNKNOWN",
		};
		return result;
	}
}
