"use client";

import { updateApartment } from "@/action/apartaments/update-apartment.api";
import type { IApartment } from "@/types/apartment.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UpdateApartmentArgs {
	id: string | number;
	data: Partial<IApartment>;
	params?: Record<string, number>;
}

export function useUpdateApartment() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: async ({ id, data, params }: UpdateApartmentArgs) => {
			const res = await updateApartment(id, data, params);

			if (res._meta?.error) throw new Error(res._meta.error);
			if (!res.data) throw new Error("Ma'lumot yangilanmadi");

			return res.data;
		},

		onSuccess: (data, variables) => {
			const apartmentId = String(variables.id);

			queryClient.invalidateQueries({ queryKey: ["apartments"] });
			queryClient.setQueryData(["apartments", "detail", apartmentId], data);

			if (data.building_id) {
				queryClient.invalidateQueries({
					queryKey: ["buildings", "detail", data.building_id],
				});
			}

			toast.success("Квартира успешно обновлена");
			router.refresh();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Не удалось обновить квартиру");
		},
	});
}
