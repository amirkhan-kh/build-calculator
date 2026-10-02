"use client";

import { deleteRole } from "@/action/roles/delete-role.api";
import { QueryKeys } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteRole() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number | string) => deleteRole(id),
		onSuccess: (res) => {
			const meta = res._meta;

			if (meta?.status && meta.status >= 400) {
				toast.error(`Ошибка: ${meta.error}`);
				return;
			}

			toast.success("Роль успешно удалена");

			queryClient.invalidateQueries({
				queryKey: QueryKeys.roles.lists(),
			});
		},
		onError: (error: Error) => {
			toast.error(`Критическая ошибка: ${error.message}`);
		},
	});
}
