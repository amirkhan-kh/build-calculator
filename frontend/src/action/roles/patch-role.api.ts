import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { IPatchRolePayload } from "@/types/permissions.types";
import type { IRole } from "@/types/role.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function patchRole(
	id: number | string,
	payload: IPatchRolePayload,
): Promise<SafeObject<IRole>> {
	const result: SafeObject<IRole> = { data: {} as IRole };

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

		const res = await fetch(`${ENV.PUBLIC_API_URL}/roles/${id}/`, {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${authData.access}`,
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			result._meta = {
				status: res.status,
				error: errorData?.detail || "Ошибка при обновлении роли",
				reason: "HTTP",
			};
			return result;
		}

		const data: IRole = await res.json();
		return { data };
	} catch (err) {
		result._meta = {
			status: 500,
			error: err instanceof Error ? err.message : "Непредвиденная ошибка",
			reason: "UNKNOWN",
		};
		return result;
	}
}
