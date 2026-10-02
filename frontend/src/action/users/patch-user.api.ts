import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { IUser } from "@/types/user.types";

export async function patchUser(id: number | string, payload: Partial<IUser>) {
	try {
		const authData = await getAuthData();
		return await fetch(`${ENV.PUBLIC_API_URL}/users/${id}/`, {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${authData?.access}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});
	} catch (error) {
		throw error;
	}
}
