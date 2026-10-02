import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { ILayout } from "@/types/layout.types";

export async function uploadLayoutImage(
    layoutId: number,
    file: File,
): Promise<ILayout | null> {
    try {
        const authData = await getAuthData();
        if (!authData?.access) return null;

        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(
            `${ENV.PUBLIC_API_URL}/layouts/${layoutId}/image`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${authData.access}`,
                },
                body: formData,
            },
        );

        if (!res.ok) return null;
        return (await res.json()) as ILayout;
    } catch {
        return null;
    }
}
