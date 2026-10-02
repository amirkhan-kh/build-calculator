"use client";

import { createApartment } from "@/action/apartaments/create-apartment.api";
import type { IApartment } from "@/types/apartment.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateApartmentArgs {
	payload: Partial<IApartment>;
	params?: Record<string, unknown>;
}

export function useCreateApartment() {
	const queryClient = useQueryClient();

	return useMutation<IApartment, Error, CreateApartmentArgs>({
		mutationFn: async ({ payload, params }) => {
			const res = await createApartment(payload, params || {});

			if (res._meta?.error) {
				throw new Error(res._meta.error);
			}

			if (!res.data) {
				throw new Error("Данные не найдены");
			}

			return res.data;
		},
		onSuccess: (data) => {
			toast.success("Квартира успешно создана");

			queryClient.invalidateQueries({ queryKey: ["apartments"] });

			if (data.building_id) {
				queryClient.invalidateQueries({
					queryKey: ["buildings", "detail", data.building_id],
				});
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Не удалось создать квартиру");
		},
	});
}
