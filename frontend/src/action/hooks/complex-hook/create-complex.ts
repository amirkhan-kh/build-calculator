"use client";

import { createComplex } from "@/action/complex/create-complex.api";
import { QueryKeys } from "@/lib/query-keys";
import { IComplex } from "@/types/complex.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateComplex() {
	const queryClient = useQueryClient();
	return useMutation<IComplex, Error, Partial<IComplex>>({
		mutationFn: async (payload) => {
			const res = await createComplex(payload);
			if (res._meta?.error) {
				throw new Error(res._meta.error);
			}
			if (!res.data) {
				throw new Error("Данные комплекса не получены");
			}
			return res.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: QueryKeys.complex.all });

			queryClient.setQueryData(QueryKeys.complex.detail(data.id), data);
		},
		onError: (error) => {
			toast.error(error.message || "Не удалось создать комплекс");
		},
	});
}
