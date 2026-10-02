"use client";

import { deletePermission } from "@/action/permissions/delete-permission.api";
import { QueryKeys } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeletePermission() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number | string) => deletePermission(id),
		onSuccess: (res) => {
			if (res._meta?.status && res._meta.status >= 400) {
				toast.error(`Ошибка: ${res._meta.error}`);
				return;
			}

			toast.success("Разрешение успешно удалено");
			queryClient.invalidateQueries({
				queryKey: QueryKeys.permissions.lists(),
			});
		},
		onError: (error: Error) => {
			toast.error(`Критическая ошибка: ${error.message}`);
		},
	});
}
