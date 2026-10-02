"use client";

import { updateBuilding } from "@/action/buildings/update-building.api";
import { QueryKeys } from "@/lib/query-keys";
import type { IBuildings } from "@/types/building.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateBuildingMutationArgs {
	id: string | number;
	data: Partial<IBuildings>;
	params?: Record<string, unknown>;
}

export function useUpdateBuilding() {
	const queryClient = useQueryClient();

	return useMutation<IBuildings, Error, UpdateBuildingMutationArgs>({
		mutationFn: async ({ id, data, params }) => {
			const res = await updateBuilding(id, data, params || {});

			if (res._meta?.error) {
				throw new Error(res._meta.error);
			}

			if (!res.data) {
				throw new Error("Serverdan kutilmagan javob keldi");
			}

			return res.data;
		},

		onSuccess: (data, variables) => {
			toast.success("Здание успешно обновлено");

			queryClient.invalidateQueries({
				queryKey: QueryKeys.buildings.all,
			});
			queryClient.setQueryData(QueryKeys.buildings.detail(variables.id), data);

			if (data.complex_id) {
				queryClient.invalidateQueries({
					queryKey: [...QueryKeys.buildings.all, "complex", data.complex_id],
				});
			}
		},

		onError: (error) => {
			toast.error(error.message || "Ошибка при обновлении здания");
		},
	});
}
