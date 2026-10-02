"use client";

import { postPermission } from "@/action/permissions/post-permission.api";
import { QueryKeys } from "@/lib/query-keys";
import type { IPermission } from "@/types/permissions.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function usePostPermission() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Omit<IPermission, "id">) => postPermission(data),
		onSuccess: (res) => {
			if (res._meta?.status && res._meta.status >= 400) {
				toast.error(`Ошибка: ${res._meta.error}`);
				return;
			}

			toast.success("Разрешение успешно создано");
			queryClient.invalidateQueries({
				queryKey: QueryKeys.permissions.lists(),
			});
		},
		onError: (err: Error) => {
			toast.error(`Критическая ошибка: ${err.message}`);
		},
	});
}
