"use client";

import { updateCoefficient } from "@/action/coefficient/update-coefficients.api";
import { QueryKeys } from "@/lib/query-keys";
import type { ICoefficient } from "@/types/coefficient-type.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateCoefficientArgs {
	id: string | number;
	data: Partial<ICoefficient>;
	params?: Record<string, unknown>;
}

export function useUpdateCoefficient() {
	const queryClient = useQueryClient();

	return useMutation<ICoefficient | null, Error, UpdateCoefficientArgs>({
		mutationFn: async ({ id, data, params }) => {
			const res = await updateCoefficient(id, data, params || {});

			if (res._meta?.error) {
				throw new Error(res._meta.error);
			}
			return res.data;
		},
		onSuccess: (data, variables) => {
			toast.success("Коэффициент успешно обновлен");

			const coefficientId = variables.id as number;
			queryClient.invalidateQueries({ queryKey: QueryKeys.coefficients.all });
			queryClient.invalidateQueries({
				queryKey: QueryKeys.coefficients.detail(coefficientId),
			});

			if (data?.building_id) {
				queryClient.invalidateQueries({
					queryKey: QueryKeys.buildings.detail(data.building_id),
				});
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Произошла ошибка при обновлении");
		},
	});
}
