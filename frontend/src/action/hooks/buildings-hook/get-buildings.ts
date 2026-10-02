"use client";

import { useQuery } from "@tanstack/react-query";
import { getBuildings } from "@/action/buildings/get-buildings.api";
import { QueryKeys } from "@/lib/query-keys";

export function useBuildings(filters: { search?: string; page?: number; complex_id?: string | number } | null = {}) {
    return useQuery({
        queryKey: [...QueryKeys.buildings.lists(), filters],
        queryFn: () => getBuildings(filters!),
        enabled: filters !== null,
    });
}
