"use client";

import { getUserById } from "@/action/users/get-user.api";
import { QueryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useUserById(id: number | string) {
	return useQuery({
		queryKey: QueryKeys.users.detail(id),
		queryFn: () => getUserById(id),
		enabled: !!id,
	});
}
