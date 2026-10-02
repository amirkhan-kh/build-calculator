"use client";

import { patchRole } from "@/action/roles/patch-role.api";
import { QueryKeys } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { IUpdateRoleArgs } from "@/types/permissions.types";

export function usePatchRole() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: IUpdateRoleArgs) => patchRole(id, payload),
		onSuccess: (res, variables) => {
			if (res._meta?.status && res._meta.status >= 400) {
				toast.error(`Ошибка: ${res._meta.error}`);
				return;
			}

			toast.success("Роль успешно обновлена");
			queryClient.invalidateQueries({ queryKey: QueryKeys.roles.lists() });
			queryClient.invalidateQueries({
				queryKey: QueryKeys.roles.detail(variables.id),
			});
		},
		onError: (err: Error) => {
			toast.error(`Критическая ошибка: ${err.message}`);
		},
	});
}
