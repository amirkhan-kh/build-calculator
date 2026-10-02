"use client";

import { deleteComplex } from "@/action/complex/delete-complex.api";
import { QueryKeys } from "@/lib/query-keys";
import type { IComplex } from "@/types/complex.types";
import type { SafeDelete } from "@/types/safe-response.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DeleteComplexArgs {
	id: number | string;
	params?: Record<string, unknown>;
}

export function useDeleteComplex() {
	const queryClient = useQueryClient();

	return useMutation<
		SafeDelete,
		Error,
		DeleteComplexArgs,
		{ previousComplexes?: IComplex[] }
	>({
		mutationFn: async ({ id, params }) => {
			const res = await deleteComplex(id, params || {});
			if (!res.success || res._meta?.error) {
				throw new Error(res._meta?.error || "Ошибка при удалении");
			}
			return res;
		},

		onMutate: async ({ id }) => {
			await queryClient.cancelQueries({ queryKey: QueryKeys.complex.all });

			const previousComplexes = queryClient.getQueryData<IComplex[]>(
				QueryKeys.complex.lists(),
			);
			if (previousComplexes) {
				queryClient.setQueryData<IComplex[]>(
					QueryKeys.complex.lists(),
					previousComplexes.filter((complex) => complex.id !== Number(id)),
				);
			}

			return { previousComplexes };
		},

		onSuccess: (_, variables) => {
			toast.success("Жилой комплекс успешно удален");
			queryClient.invalidateQueries({ queryKey: QueryKeys.complex.all });
			queryClient.removeQueries({
				queryKey: QueryKeys.complex.detail(variables.id as number),
			});
		},

		onError: (error, _, context) => {
			if (context?.previousComplexes) {
				queryClient.setQueryData(
					QueryKeys.complex.lists(),
					context.previousComplexes,
				);
			}
			toast.error(error.message || "Не удалось удалить комплекс");
		},
	});
}
