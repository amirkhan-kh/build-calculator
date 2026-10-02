import { useMutation } from "@tanstack/react-query";
import { loginAction } from "@/action/auth/login.action";
import type { LoginPayload } from "@/types/auth.types";

export function useLogin() {
	return useMutation<void, Error, LoginPayload>({
		mutationFn: async ({ username, password }) => {
			const formData = new FormData();
			formData.append("username", username);
			formData.append("password", password);
			await loginAction(formData);
		},
	});
}
