export interface CalculatePricingPayload {
	first_investment_rate: number;
	first_payment_date: string;
	period_count: number;
	price_per_sqrm?: number;
}

export interface CalculatePricingResponse {
	block: string;
	floor: number;
	area: number;
	first_investment_rate: number;
	first_payment_date: string;
	period_count: number;
	old_price_per_sqrm: number;
	new_price_per_sqrm: number;
	old_total_price: number;
	new_total_price: number;
	monthly_payment: number;
	payment_dates: string[];
}
export type InvestmentType = "percentage" | "amount";
