import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { IFirm } from "@/types/firm.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function getFirms(params: {
	name__ilike?: string;
	is_active?: boolean;
} = {}): Promise<SafeObject<IFirm[]>> {
	const result: SafeObject<IFirm[]> = { data: null };

	try {
		const auth = await getAuthData();
		if (!auth?.access) {
			result._meta = { status: 401, error: "Unauthorized", reason: "TOKEN" };
			return result;
		}

		const search = new URLSearchParams();
		if (params.name__ilike) search.set("name__ilike", params.name__ilike);
		if (params.is_active !== undefined) search.set("is_active", String(params.is_active));

		const res = await fetch(
			`${ENV.PUBLIC_API_URL}/firms/${search.toString() ? `?${search}` : ""}`,
			{
				headers: { Authorization: `Bearer ${auth.access}` },
				cache: "no-store",
			},
		);

		if (!res.ok) {
			result._meta = { status: res.status, error: "HTTP error", reason: "HTTP" };
			return result;
		}

		result.data = (await res.json()) as IFirm[];
		return result;
	} catch (error) {
		result._meta = {
			status: 500,
			error: error instanceof Error ? error.message : "Server error",
			reason: "UNKNOWN",
		};
		return result;
	}
}
