"use client";

import { deleteCoefficient } from "@/action/coefficient/delete-coefficients.api";
import { QueryKeys } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DeleteCoefficientArgs {
	id: string | number;
	params?: Record<string, unknown>;
}

export function useDeleteCoefficient(buildingId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, params }: DeleteCoefficientArgs) =>
			deleteCoefficient(id, params || {}),

		onSuccess: (response) => {
			if (response.success) {
				toast.success("Коэффициент удален");
				queryClient.invalidateQueries({ queryKey: QueryKeys.coefficients.all });
				queryClient.invalidateQueries({
					queryKey: ["coefficient-types", buildingId],
				});
				queryClient.invalidateQueries({
					queryKey: ["coefficients", "building", buildingId],
				});
			} else {
				toast.error(response._meta?.error || "Произошла ошибка.");
			}
		},
		onError: (error: unknown) => {
			const message =
				error instanceof Error ? error.message : "O'chirishda xatolik";
			toast.error(message);
		},
	});
}
