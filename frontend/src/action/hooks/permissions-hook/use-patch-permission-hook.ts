"use client";

import { patchPermission } from "@/action/permissions/patch-permission.api";
import { QueryKeys } from "@/lib/query-keys";
import type { IUpdatePermissionPayload } from "@/types/permissions.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function usePatchPermission() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: IUpdatePermissionPayload) =>
			patchPermission(id, data),
		onSuccess: (res, variables) => {
			if (res._meta?.status && res._meta.status >= 400) {
				toast.error(`Ошибка: ${res._meta.error}`);
				return;
			}

			toast.success("Разрешение успешно обновлено");
			queryClient.invalidateQueries({
				queryKey: QueryKeys.permissions.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: QueryKeys.permissions.detail(variables.id),
			});
		},
		onError: (err: Error) => {
			toast.error(`Критическая ошибка: ${err.message}`);
		},
	});
}
