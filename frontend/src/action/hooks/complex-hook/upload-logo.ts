"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import { uploadComplexLogo } from "@/action/complex/upload-complex-logo.api";

export function useUploadComplexLogo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, file }: { id: number; file: File }) => {
			const res = await uploadComplexLogo(id, file);
			if (res._meta?.error) {
				throw new Error(res._meta.error);
			}
			if (!res.data) {
				throw new Error("Логотип не загружен");
			}
			return res;
		},

		onSuccess: (res, variables) => {
			if (res.data) {
				toast.success("Логотип успешно обновлён");
				queryClient.invalidateQueries({ queryKey: QueryKeys.complex.all });
				queryClient.invalidateQueries({
					queryKey: QueryKeys.complex.detail(variables.id),
				});
			}
		},

		onError: (error: Error) => {
			toast.error(error.message || "Не удалось загрузить логотип");
		},
	});
}
