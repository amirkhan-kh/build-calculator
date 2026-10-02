"use client";

import { postRole } from "@/action/roles/post-role.api";
import { QueryKeys } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ICreateRolePayload } from "@/types/role.types";

export function usePostRole() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ICreateRolePayload) => postRole(data),
		onSuccess: (res) => {
			if (res._meta?.status && res._meta.status >= 400) {
				toast.error(`Ошибка: ${res._meta.error}`);
				return;
			}

			toast.success("Роль успешно создана");

			queryClient.invalidateQueries({
				queryKey: QueryKeys.roles.lists(),
			});
		},
		onError: (error: Error) => {
			toast.error(`Критическая ошибка: ${error.message}`);
		},
	});
}
