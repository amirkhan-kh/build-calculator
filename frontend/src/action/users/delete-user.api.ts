import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";

export async function deleteUser(id: number | string) {
	try {
		const authData = await getAuthData();
		return await fetch(`${ENV.PUBLIC_API_URL}/users/${id}/`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${authData?.access}`,
			},
		});
	} catch (error) {
		throw error;
	}
}
