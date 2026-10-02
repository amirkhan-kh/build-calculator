import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { SafeObject } from "@/types/safe-response.types";

export async function deletePermission(
	id: number | string,
): Promise<SafeObject<{ success: boolean }>> {
	const result: SafeObject<{ success: boolean }> = {
		data: { success: false },
	} as SafeObject<{ success: boolean }>;

	try {
		const authData = await getAuthData();

		if (!authData?.access) {
			result._meta = {
				status: 401,
				error: "Неавторизованный токен",
				reason: "TOKEN",
			};
			return result;
		}

		const res = await fetch(`${ENV.PUBLIC_API_URL}/permissions/${id}/`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${authData.access}`,
			},
		});

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			result._meta = {
				status: res.status,
				error: errorData?.detail || "Не удалось удалить разрешение",
				reason: "HTTP",
			};
			return result;
		}

		return { data: { success: true } };
	} catch (err) {
		result._meta = {
			status: 500,
			error: err instanceof Error ? err.message : "Ошибка при удалении",
			reason: "UNKNOWN",
		};
		return result;
	}
}
