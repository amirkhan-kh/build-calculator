"use client";

import { createFirm } from "@/action/firms/create-firm.api";
import { QueryKeys } from "@/lib/query-keys";
import { IFirm } from "@/types/firm.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateFirm() {
	const queryClient = useQueryClient();
	return useMutation<
		IFirm,
		Error,
		{ name: string; username: string; password: string }
	>({
		mutationFn: async (payload) => {
			const res = await createFirm(payload);
			if (res._meta?.error) {
				throw new Error(res._meta.error);
			}
			if (!res.data) {
				throw new Error("Firma yaratilmadi");
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
