import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { IPermission } from "@/types/permissions.types";

export async function getPermissionById(
	id: number | string,
): Promise<IPermission | null> {
	try {
		const authData = await getAuthData();
		if (!authData?.access) return null;

		const res = await fetch(`${ENV.PUBLIC_API_URL}/permissions/${id}/`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${authData.access}`,
				"Content-Type": "application/json",
			},
		});

		if (!res.ok) return null;
		return (await res.json()) as IPermission;
	} catch {
		return null;
	}
}
