import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { IUser } from "@/types/user.types";

export async function getUserById(id: number | string) {
	try {
		const authData = await getAuthData();
		const res = await fetch(`${ENV.PUBLIC_API_URL}/users/${id}/`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${authData?.access}`,
				"Content-Type": "application/json",
			},
		});
		if (!res.ok) return null;
		return (await res.json()) as IUser;
	} catch {
		return null;
	}
}
