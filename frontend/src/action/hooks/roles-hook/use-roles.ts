"use client";

import { getRoles } from "@/action/roles/get-roles.api";
import { QueryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import type { IRoleFilters } from "@/types/role.types";

export function useRoles(filters: IRoleFilters = {}) {
	return useQuery({
		queryKey: QueryKeys.roles.list(filters),
		queryFn: () => getRoles(filters),
	});
}
