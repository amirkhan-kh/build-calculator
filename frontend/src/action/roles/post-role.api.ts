import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type { ICreateRolePayload, IRole } from "@/types/role.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function postRole(
	payload: ICreateRolePayload,
	params: Record<string, unknown> = {},
): Promise<SafeObject<IRole>> {
	const queryStr = createSearchParams(params).toString();
	const url = `${ENV.PUBLIC_API_URL}/roles/create/${queryStr ? `?${queryStr}` : ""}`;

	try {
		const authData = await getAuthData();

		if (!authData?.access) {
			return {
				data: {} as IRole,
				_meta: {
					status: 401,
					error: "Неавторизованный токен",
					reason: "TOKEN",
				},
			};
		}

		const res = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${authData.access}`,
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const errorResponse = await res.json().catch(() => ({}));
			return {
				data: {} as IRole,
				_meta: {
					status: res.status,
					error:
						errorResponse?.detail ||
						errorResponse?.message ||
						`Ошибка HTTP ${res.status}`,
					reason: "HTTP",
				},
			};
		}

		const responseData: IRole = await res.json();
		return { data: responseData };
	} catch (err) {
		return {
			data: {} as IRole,
			_meta: {
				status: 500,
				error:
					err instanceof Error ? err.message : "Непредвиденная ошибка сервера",
				reason: "UNKNOWN",
			},
		};
	}
}
