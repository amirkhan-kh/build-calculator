"use client";

import { deleteBuilding } from "@/action/buildings/delete-building.api";
import { QueryKeys } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteBuilding() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			params,
		}: {
			id: string | number;
			params?: Record<string, number>;
		}) => deleteBuilding(id, params || {}),

		onSuccess: (response, variables) => {
			const { id } = variables;

			if (response.success) {
				queryClient.invalidateQueries({
					queryKey: QueryKeys.buildings.all,
				});
				queryClient.removeQueries({
					queryKey: QueryKeys.buildings.detail(id),
				});
			}
		},
		onError: (error) => {
			toast.error(error.message || "Произошла непредвиденная ошибка.");
		},
	});
}
