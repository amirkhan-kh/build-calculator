"use client";

import { getBuildingsByComplexId } from "@/action/buildings/get-building-by-complexes.api";
import { useQuery } from "@tanstack/react-query";

export function useBuildingsByComplex(complexId: string | number) {
	return useQuery({
		queryKey: ["buildings", "by-complex", complexId],
		queryFn: () => getBuildingsByComplexId(complexId),
	});
}
