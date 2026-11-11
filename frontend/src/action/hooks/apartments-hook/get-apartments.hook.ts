"use client";

import { useQuery } from "@tanstack/react-query";
import { getApartments } from "@/action/apartaments/get-apartaments.api";
import { QueryKeys } from "@/lib/query-keys";
import type { IApartment } from "@/types/apartment.types";
import type { SafeArray } from "@/types/safe-response.types";

export function useApartments(params: Record<string, number | string> | null = {}) {
    return useQuery({
        queryKey: [...QueryKeys.apartments.lists(), params],
        queryFn: () => getApartments(params!),
        enabled: params !== null,
    });
}

const PAGE_SIZE = 100;
const MAX_PAGES = 30;

export function useBuildingApartments(buildingId: number) {
    return useQuery({
        queryKey: [...QueryKeys.apartments.lists(), { building_id: buildingId, all: true }],
        queryFn: async () => {
            const all: IApartment[] = [];
            for (let page = 0; page < MAX_PAGES; page++) {
                const chunk: SafeArray<IApartment> = await getApartments({
                    building_id: buildingId,
                    limit: PAGE_SIZE,
                    offset: page * PAGE_SIZE,
                });
                if (chunk._meta?.error) throw new Error(chunk._meta.error);
                all.push(...chunk);
                if (chunk.length < PAGE_SIZE) break;
            }
            return all;
        },
        enabled: buildingId > 0,
    });
}
