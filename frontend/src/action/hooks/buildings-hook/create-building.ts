"use client";

import { createBuilding } from "@/action/buildings/create-building.api";
import { QueryKeys } from "@/lib/query-keys";
import type { IBuildings } from "@/types/building.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateBuilding() {
	const queryClient = useQueryClient();

	return useMutation<IBuildings, Error, Partial<IBuildings>>({
		mutationFn: async (payload) => {
			const res = await createBuilding(payload);
			if (res._meta?.error) {
				throw new Error(res._meta.error);
			}
			if (!res.data) {
				throw new Error("Ma'lumot topilmadi");
			}

			return res.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: QueryKeys.buildings.all,
			});

			if (data.complex_id) {
				queryClient.invalidateQueries({
					queryKey: [...QueryKeys.buildings.all, "complex", data.complex_id],
				});
			}
		},
		onError: (error) => {
			toast.error(error.message || "Не удалось создать здание");
		},
	});
}
