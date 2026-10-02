import { useMutation } from "@tanstack/react-query";
import type {
	CalculatePricingPayload,
	InvestmentType,
} from "@/types/calculator.types";
import { calculateApartmentPricing } from "@/action/calculator/create-calculator.api";

export const useCalculatePricing = () => {
	return useMutation({
		mutationFn: ({
			apartmentId,
			payload,
			investmentType,
		}: {
			apartmentId: number;
			payload: CalculatePricingPayload;
			investmentType: InvestmentType;
		}) => calculateApartmentPricing(apartmentId, payload, investmentType),
	});
};
