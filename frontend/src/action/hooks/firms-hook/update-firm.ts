"use client";

import { updateFirm } from "@/action/firms/update-firm.api";
import { QueryKeys } from "@/lib/query-keys";
import { IFirm } from "@/types/firm.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateFirm() {
	const queryClient = useQueryClient();
	return useMutation<
		IFirm,
		Error,
		{ id: number; data: Partial<Pick<IFirm, "name" | "username" | "password" | "is_active">> }
	>({
		mutationFn: async ({ id, data }) => {
			const res = await updateFirm(id, data);
			if (res._meta?.error) {
				throw new Error(res._meta.error);
			}
			if (!res.data) {
				throw new Error("Firma yangilanmadi");
			}
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QueryKeys.firms.all });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
}
