import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { IRole } from "@/types/role.types";

export async function getRoleById(id: number | string): Promise<IRole | null> {
	try {
		const authData = await getAuthData();
		if (!authData?.access) return null;

		const res = await fetch(`${ENV.PUBLIC_API_URL}/roles/${id}/`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${authData.access}`,
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			cache: "no-store",
		});

		if (!res.ok) return null;

		return (await res.json()) as IRole;
	} catch {
		return null;
	}
}
