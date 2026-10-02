"use client";

import { getCoefficients } from "@/action/coefficient/get-coefficients.api";
import { QueryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useCoefficients(params: Record<string, unknown> = {}) {
	return useQuery({
		queryKey: [...QueryKeys.coefficients.lists(), params],
		queryFn: () => getCoefficients(params),
	});
}
