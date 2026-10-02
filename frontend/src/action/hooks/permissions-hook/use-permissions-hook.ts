"use client";

import { getPermissions } from "@/action/permissions/get-permissions.api";
import { QueryKeys } from "@/lib/query-keys";
import type { IPermissionFilters } from "@/types/permissions.types";
import { useQuery } from "@tanstack/react-query";

export function usePermissions(filters: IPermissionFilters = {}) {
	return useQuery({
		queryKey: QueryKeys.permissions.list(filters),
		queryFn: () => getPermissions(filters),
	});
}
