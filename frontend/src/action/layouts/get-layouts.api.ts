import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { ILayout } from "@/types/layout.types";

export async function getLayoutsByBuilding(buildingId: number): Promise<ILayout[]> {
    try {
        const authData = await getAuthData();
        if (!authData?.access) return [];

        const res = await fetch(
            `${ENV.PUBLIC_API_URL}/layouts/?building_id=${buildingId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authData.access}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}
