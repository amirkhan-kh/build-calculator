import { ENV } from "@/configs/env.config";
import { createSearchParams } from "@/lib/api.util";
import { getAuthData } from "@/lib/auth.util";
import type {
	CalculatePricingPayload,
	CalculatePricingResponse,
	InvestmentType,
} from "@/types/calculator.types";
import type { SafeObject } from "@/types/safe-response.types";

export async function calculateApartmentPricing(
	apartmentId: number | string,
	payload: CalculatePricingPayload,
	investmentType: InvestmentType,
) {
	const result: SafeObject<CalculatePricingResponse> = { data: null };

	const searchParams = createSearchParams({
		first_investment_type: investmentType,
	}).toString();

	try {
		const authData = await getAuthData();

		if (!authData?.access) {
			result._meta = {
				status: 401,
				error: "Ошибка авторизации",
				reason: "TOKEN",
			};
			return result;
		}

		const res = await fetch(
			`${ENV.PUBLIC_API_URL}/calculator/${apartmentId}/?${searchParams}`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${authData.access}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			},
		);

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			result._meta = {
				status: res.status,
				error: errorData.detail || `Ошибка: ${res.status}`,
				reason: "HTTP",
			};
			return result;
		}

		result.data = (await res.json()) as CalculatePricingResponse;
		return result;
	} catch (error: unknown) {
		result._meta = {
			status: 500,
			error: error instanceof Error ? error.message : "Ошибка сервера",
			reason: "UNKNOWN",
		};
		return result;
	}
}
