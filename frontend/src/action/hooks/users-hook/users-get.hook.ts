"use client";

import { getUsers } from "@/action/users/get-users.api";
import { QueryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useUsers(filters: Record<string, unknown> = {}) {
	return useQuery({
		queryKey: QueryKeys.users.list(filters),
		queryFn: () => getUsers(filters),
	});
}
