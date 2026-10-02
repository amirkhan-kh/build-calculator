import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";
import type { IComplex } from "@/types/complex.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function uploadComplexLogo(
	complexId: number,
	file: File,
): Promise<SafeObject<IComplex>> {
	const result: SafeObject<IComplex> = { data: null };

	try {
		const auth = await getAuthData();
		if (!auth?.access) {
			result._meta = { status: 401, error: "Unauthorized", reason: "TOKEN" };
			return result;
		}

		const formData = new FormData();
		formData.append("image", file);

		const res = await fetch(
			`${ENV.PUBLIC_API_URL}/complexes/${complexId}/logo`,
			{
				method: "PATCH",
				headers: { Authorization: `Bearer ${auth.access}` },
				body: formData,
			},
		);

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			result._meta = {
				status: res.status,
				error: (err as { detail?: string }).detail || "Ошибка загрузки логотипа",
				reason: "HTTP",
			};
			return result;
		}

		result.data = (await res.json()) as IComplex;
		return result;
	} catch (error) {
		result._meta = {
			status: 500,
			error: error instanceof Error ? error.message : "Неизвестная ошибка",
			reason: "UNKNOWN",
		};
		return result;
	}
}
