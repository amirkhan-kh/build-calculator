"use client";

import { getComplexById } from "@/action/complex/get-complex.api";
import type { IComplex } from "@/types/complex.types";
import { useQuery } from "@tanstack/react-query";

export function useComplexById(
	id?: string | number,
	params: Record<string, unknown> = {},
) {
	return useQuery<IComplex, Error>({
		queryKey: ["complex", "detail", id, params],
		queryFn: async () => {
			if (!id) throw new Error("ID не найден");

			const res = await getComplexById(id, params);

			if (res._meta?.error) {
				throw new Error(res._meta.error);
			}

			if (!res.data) {
				throw new Error("Данные не найдены");
			}

			return res.data;
		},
	});
}
