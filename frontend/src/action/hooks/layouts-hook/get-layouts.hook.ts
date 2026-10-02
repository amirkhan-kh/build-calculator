"use client";

import { useQuery } from "@tanstack/react-query";
import { getLayoutsByBuilding } from "@/action/layouts/get-layouts.api";

export function useLayoutsByBuilding(buildingId: number | string | null) {
    return useQuery({
        queryKey: ["layouts", "building", buildingId],
        queryFn: () => getLayoutsByBuilding(Number(buildingId)),
        enabled: !!buildingId,
    });
}
