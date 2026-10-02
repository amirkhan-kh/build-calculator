"use client";

import { deleteUser } from "@/action/users/delete-user.api";
import { QueryKeys } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number | string) => deleteUser(id),
		onSuccess: () => {
			toast.success("Пользователь удален");
			queryClient.invalidateQueries({ queryKey: QueryKeys.users.lists() });
		},
		onError: () => {
			toast.error("Не удалось удалить пользователя");
		},
	});
}
