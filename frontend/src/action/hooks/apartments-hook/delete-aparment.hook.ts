"use client";

import { deleteApartment } from "@/action/apartaments/delete-apartment.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteApartment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			params,
		}: {
			id: string | number;
			params?: Record<string, number>;
		}) => deleteApartment(id, params || {}),

		onSuccess: (response, variables) => {
			if (response.success) {
				const { id } = variables;

				queryClient.invalidateQueries({ queryKey: ["apartments"] });
				queryClient.removeQueries({
					queryKey: ["apartments", "detail", id],
				});

				toast.success("Квартира успешно удалена");
			} else {
				toast.error(response._meta?.error || "Ошибка при удалении");
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Не удалось удалить квартиру");
		},
	});
}
