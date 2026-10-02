"use client";

import { updateCoefficientType } from "@/action/coefficient-types/update-coefficcient.api";
import { UpdateCoefficientTypePayload } from "@/types/coefficient-type.types";
import { QueryKey, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateCoeffMutationArgs {
	id: number;
	data: UpdateCoefficientTypePayload;
	params?: Record<string, unknown>;
}

export function useUpdateCoefficientType(
	buildingId?: number,
	extraKey?: QueryKey,
) {
	const queryClient = useQueryClient();

	return useMutation<unknown, Error, UpdateCoeffMutationArgs>({
		mutationFn: async ({ id, data, params }) => {
			const res = await updateCoefficientType(id, data, params || {});

			if (res._meta?.error) {
				throw new Error(res._meta.error);
			}
			return res.data;
		},
		onSuccess: () => {
			toast.success("Обновлено успешно");

			if (buildingId) {
				queryClient.invalidateQueries({
					queryKey: ["coefficient-types", buildingId],
				});
			}

			if (extraKey) {
				queryClient.invalidateQueries({
					queryKey: extraKey,
					exact: false,
				});
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Ошибка при обновлении");
		},
	});
}
