import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";

export async function deleteLayout(layoutId: number): Promise<boolean> {
    try {
        const authData = await getAuthData();
        if (!authData?.access) return false;

        const res = await fetch(`${ENV.PUBLIC_API_URL}/layouts/${layoutId}/`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${authData.access}` },
        });

        return res.ok || res.status === 204;
    } catch {
        return false;
    }
}
