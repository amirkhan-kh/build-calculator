import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import { SafeObject } from "@/types/safe-response.types";

export interface BulkCreateResponseData {
	message?: string;
	count?: number;
	detail?: string | string[];
	errors?: string[];
}

export async function bulkCreateApartments(
	buildingId: number | string,
	file: File,
): Promise<SafeObject<BulkCreateResponseData>> {
	const result: SafeObject<BulkCreateResponseData> = {
		data: null,
	};

	const searchParams = createSearchParams({
		building_id: buildingId,
	}).toString();

	try {
		const authData = await getAuthData();
		if (!authData?.access) {
			result._meta = {
				status: 401,
				error: "Ошибка авторизации: Токен не найден",
				reason: "TOKEN",
			};
			return result;
		}

		const formData = new FormData();
		formData.append("excel_file", file);
		const res = await fetch(
			`${ENV.PUBLIC_API_URL}/apartments/bulk-create/${searchParams ? `?${searchParams}` : ""}`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${authData.access}`,
				},
				body: formData,
			},
		);

		const responseData: BulkCreateResponseData = await res.json();

		if (!res.ok) {
			result._meta = {
				status: res.status,
				reason: "HTTP",
				error:
					typeof responseData.detail === "string"
						? responseData.detail
						: Array.isArray(responseData.detail)
							? responseData.detail.join(", ")
							: responseData.message || `Ошибка HTTP: ${res.status}`,
			};
			return result;
		}

		result.data = responseData;
		result._meta = { status: res.status, reason: "HTTP" };
		return result;
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : "Непредвиденная ошибка сервера";
		result._meta = {
			status: 500,
			error: errorMessage,
			reason: "UNKNOWN",
		};
		return result;
	}
}
