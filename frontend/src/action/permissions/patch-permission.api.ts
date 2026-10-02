import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { IPermission } from "@/types/permissions.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function patchPermission(
	id: number | string,
	payload: Partial<IPermission>,
	params: Record<string, unknown> = {},
): Promise<SafeObject<IPermission>> {
	const result: SafeObject<IPermission> = { data: {} as IPermission };

	const queryStr = createSearchParams(params).toString();
	const url = `${ENV.PUBLIC_API_URL}/permissions/${id}/${queryStr ? `?${queryStr}` : ""}`;

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

		const res = await fetch(url, {
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
				error: errorData?.detail || "Ошибка при обновлении разрешения",
				reason: "HTTP",
			};
			return result;
		}

		const data: IPermission = await res.json();
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
