import { getAuthMe } from "@/action/auth/login-me.action";
import { useQuery } from "@tanstack/react-query";

export function useAuthMe() {
	return useQuery({
		queryKey: ["auth-me"],
		queryFn: () => getAuthMe(),
	});
}
