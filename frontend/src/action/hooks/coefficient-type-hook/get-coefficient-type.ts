"use client";

import { getCoefficientTypesByBuildingId } from "@/action/coefficient-types/get-coefficient-type.api";
import { useQuery } from "@tanstack/react-query";

export function useCoefficientTypesByBuildingId(
	buildingId: number | string,
	params: Record<string, unknown> = {},
) {
	return useQuery({
		queryKey: ["coefficient-types", buildingId, params],
		queryFn: () => getCoefficientTypesByBuildingId(buildingId, params),
	});
}
