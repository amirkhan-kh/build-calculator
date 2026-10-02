"use client";

import { getFirms } from "@/action/firms/get-firms.api";
import { QueryKeys } from "@/lib/query-keys";
import { IFirm } from "@/types/firm.types";
import { useQuery } from "@tanstack/react-query";

export function useFirms(params: { name__ilike?: string; is_active?: boolean } = {}) {
	return useQuery<IFirm[]>({
		queryKey: QueryKeys.firms.list(params),
		queryFn: async () => {
			const res = await getFirms(params);
			if (res._meta?.error) {
				throw new Error(res._meta.error);
			}
			return res.data ?? [];
		},
	});
}
