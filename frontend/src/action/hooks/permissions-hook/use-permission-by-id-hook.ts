"use client";

import { getPermissionById } from "@/action/permissions/get-permission-by-id.api";
import { QueryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export function usePermissionById(id: number | string) {
	return useQuery({
		queryKey: QueryKeys.permissions.detail(id),
		queryFn: () => getPermissionById(id),
		enabled: !!id,
	});
}
