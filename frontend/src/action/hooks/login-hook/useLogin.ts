import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginAction } from "@/action/auth/login.action";
import { clearAuthCache } from "@/lib/auth.util";
import type { LoginPayload } from "@/types/auth.types";

export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, LoginPayload>({
		mutationFn: async ({ username, password }) => {
			const formData = new FormData();
			formData.append("username", username);
			formData.append("password", password);
			await loginAction(formData);
		},
		onSuccess: () => {
			clearAuthCache();
			queryClient.clear();
		},
	});
}
