"use client";

import { updateComplex } from "@/action/complex/update-complex.api";
import type { IComplex } from "@/types/complex.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateComplexArgs {
	id: number | string;
	data: Partial<IComplex>;
	params?: Record<string, unknown>;
}

export function useUpdateComplex() {
	const queryClient = useQueryClient();

	return useMutation<IComplex, Error, UpdateComplexArgs>({
		mutationFn: async ({ id, data, params }) => {
			const res = await updateComplex(id, data, params || {});

			if (res._meta?.error) {
				throw new Error(res._meta.error);
			}

			if (!res.data) {
				throw new Error("Данные не обновлены");
			}

			return res.data;
		},

		onSuccess: (data) => {
			queryClient.setQueryData(["complex", "detail", data.id], data);

			queryClient.invalidateQueries({
				queryKey: ["complex"],
			});

			toast.success("Жилой комплекс успешно обновлен");
		},

		onError: (error) => {
			toast.error(error.message || "Произошла ошибка при обновлении");
		},
	});
}
