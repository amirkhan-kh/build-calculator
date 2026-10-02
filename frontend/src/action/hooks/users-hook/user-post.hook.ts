"use client";

import { QueryKeys } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { IUser } from "@/types/user.types";
import { postUser } from "@/action/users/create-user.api";

export function usePostUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Omit<IUser, "id">) => postUser(data),
		onSuccess: () => {
			toast.success("Пользователь успешно создан");
			queryClient.invalidateQueries({ queryKey: QueryKeys.users.lists() });
		},
		onError: () => {
			toast.error("Ошибка при создании пользователя");
		},
	});
}
