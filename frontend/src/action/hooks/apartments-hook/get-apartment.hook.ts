"use client";
import { getApartmentById } from "@/action/apartaments/get-apartament.api";
import { QueryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useApartmentById(
	id: number | string,
	params: Record<string, number> = {},
) {
	return useQuery({
		queryKey: [...QueryKeys.apartments.detail(id), params],
		queryFn: () => getApartmentById(id, params),
	});
}
