"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bulkCreateApartments } from "@/action/create-excel/bulk-create-apartments.api";
import { QueryKeys } from "@/lib/query-keys";

interface BulkCreateArgs {
	buildingId: number | string;
	file: File;
}

export function useBulkCreateApartments() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ buildingId, file }: BulkCreateArgs) =>
			bulkCreateApartments(buildingId, file),

		onSuccess: (res) => {
			if (res._meta?.error) {
				toast.error(res._meta.error, { duration: 5000 });
				return;
			}

			if (res.data) {
				queryClient.invalidateQueries({ queryKey: QueryKeys.apartments.all });

				const errors = res.data.errors;
				if (errors && errors.length > 0) {
					toast.warning(
						`Импорт завершён с ошибками: ${errors.length} строк не загружено`,
						{ duration: 5000 },
					);
				} else {
					toast.success("Квартиры успешно импортированы");
				}
			}
		},

		onError: (error: Error) => {
			toast.error(error.message || "Не удалось загрузить файл");
		},
	});
}
