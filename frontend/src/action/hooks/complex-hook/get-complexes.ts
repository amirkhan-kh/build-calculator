import { useQuery } from "@tanstack/react-query";
import { getComplexes } from "@/action/complex/get-complexes.api";
import { QueryKeys } from "@/lib/query-keys";

export function useComplexes(params: Record<string, unknown> = {}) {
	return useQuery({
		queryKey: [...QueryKeys.complex.lists(), params],
		queryFn: () => getComplexes(params),
	});
}
