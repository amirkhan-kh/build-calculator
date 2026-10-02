"use client";

import { createCoefficient } from "@/action/coefficient/create-coefficients.api";
import type { CreateCoefficientPayload } from "@/types/coefficient-type.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateCoefficient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: CreateCoefficientPayload) => {
			const res = await createCoefficient(payload);

			if (res._meta?.error) {
				throw new Error(res._meta.error);
			}

			return res.data;
		},
		onSuccess: (data) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: ["coefficients"] });
				queryClient.invalidateQueries({
					queryKey: ["coefficients", "building", data.building_id],
				});
				queryClient.invalidateQueries({
					queryKey: ["coefficient-types", data.building_id],
				});

				queryClient.refetchQueries({
					queryKey: ["coefficient-types", data.building_id],
				});
			}
		},
		onError: (error) => {
			toast.error(error.message || "Xatolik yuz berdi");
		},
	});
}
