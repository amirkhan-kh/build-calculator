"use client";

import { deleteCoefficientType } from "@/action/coefficient-types/delete-coefficient.api";
import { ICoefficientTypeGroup } from "@/types/coefficient-type.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DeleteCoefficientTypeArgs {
	id: number | string;
	params?: Record<string, unknown>;
}

export function useDeleteCoefficientType(buildingId: number) {
	const queryClient = useQueryClient();

	return useMutation<void, Error, DeleteCoefficientTypeArgs>({
		mutationFn: async ({ id, params }) => {
			const res = await deleteCoefficientType(id, params || {});

			if (!res.success || res._meta?.error) {
				throw new Error(res._meta?.error || "Произошла ошибка при удалении");
			}
		},
		onSuccess: (_, variables) => {
			const deletedId = variables.id;

			queryClient.setQueryData<ICoefficientTypeGroup[]>(
				["coefficient-types", buildingId],
				(old) => {
					if (!old) return old;

					return old.map((group) => ({
						...group,
						bcts: group.bcts.filter((item) => item.id !== Number(deletedId)),
					}));
				},
			);

			queryClient.invalidateQueries({
				queryKey: ["coefficient-types", buildingId],
			});

			toast.success("Тип коэффициента успешно удален.");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}
