"use client";
import { createCoefficientType } from "@/action/coefficient-types/create-coefficient.api";
import { ICoefficientType } from "@/types/coefficient-type.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCoefficientType() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: Partial<ICoefficientType>) => {
			const res = await createCoefficientType(payload);
			if (res._meta?.error) {
				throw new Error(res._meta.error);
			}
			return res.data;
		},
		onSuccess: (data) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: ["coefficient-types"] });
				queryClient.invalidateQueries({
					queryKey: ["coefficient-types", data.building_id],
				});
				queryClient.invalidateQueries({
					queryKey: ["buildings", data.building_id],
				});
			}
		},
	});
}
