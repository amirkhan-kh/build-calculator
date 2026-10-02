import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { ICreateLayoutBody, ILayout } from "@/types/layout.types";

export async function createLayout(body: ICreateLayoutBody): Promise<ILayout | null> {
    try {
        const authData = await getAuthData();
        if (!authData?.access) return null;

        const res = await fetch(`${ENV.PUBLIC_API_URL}/layouts/add/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authData.access}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) return null;
        return (await res.json()) as ILayout;
    } catch {
        return null;
    }
}
