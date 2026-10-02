"use client";

import { patchUser } from "@/action/users/patch-user.api";
import { QueryKeys } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { IUser } from "@/types/user.types";

export function usePatchUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number | string; data: Partial<IUser> }) =>
			patchUser(id, data),
		onSuccess: (_, variables) => {
			toast.success("Данные успешно изменены");
			queryClient.invalidateQueries({ queryKey: QueryKeys.users.lists() });
			queryClient.invalidateQueries({
				queryKey: QueryKeys.users.detail(variables.id),
			});
		},
		onError: () => {
			toast.error("Ошибка при обновлении данных");
		},
	});
}
