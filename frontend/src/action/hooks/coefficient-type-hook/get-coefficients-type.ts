"use client";

import { getCoefficientTypes } from "@/action/coefficient-types/get-coefficient-types.api";
import { QueryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useCoefficientTypes(params: Record<string, unknown> = {}) {
	return useQuery({
		queryKey: [...QueryKeys.coefficientTypes?.lists(), params],
		queryFn: () => getCoefficientTypes(params),
	});
}
