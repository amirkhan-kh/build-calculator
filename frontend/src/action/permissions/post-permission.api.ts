import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { IPermission } from "@/types/permissions.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function postPermission(
	payload: Omit<IPermission, "id">,
): Promise<SafeObject<IPermission>> {
	const result: SafeObject<IPermission> = { data: {} as IPermission };

	try {
		const authData = await getAuthData();

		if (!authData?.access) {
			result._meta = {
				status: 401,
				error: "Неавторизованный доступ",
				reason: "TOKEN",
			};
			return result;
		}

		const res = await fetch(`${ENV.PUBLIC_API_URL}/permissions/create/`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${authData.access}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			result._meta = {
				status: res.status,
				error: errorData?.detail || "Ошибка при создании разрешения",
				reason: "HTTP",
			};
			return result;
		}

		const data: IPermission = await res.json();
		return { data };
	} catch (err) {
		result._meta = {
			status: 500,
			error: err instanceof Error ? err.message : "Ошибка сервера",
			reason: "UNKNOWN",
		};
		return result;
	}
}
