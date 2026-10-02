"use client";

import { getCoefficientById } from "@/action/coefficient/get-coefficient.api";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/query-keys";

export function useCoefficient(
	id: number | string | undefined,
	params: Record<string, unknown> = {},
) {
	const query = useQuery({
		queryKey: [...QueryKeys.coefficients.detail(id!), params],
		queryFn: () => getCoefficientById(id!, params),
	});

	return query;
}
