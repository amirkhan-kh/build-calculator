"use client";

import { useState, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/action/hooks/login-hook/useLogin";

export function LoginForm() {
	const router = useRouter();
	const t = useTranslations("auth");

	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const { mutate, isPending } = useLogin();

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		mutate(
			{ username, password },
			{
				onSuccess: () => {
					toast.success(t("login_success"));
					router.push("/");
					router.refresh();
				},
				onError: (err) => {
					console.error(err instanceof Error ? err.message : t("login_error"));
					toast.error(t("login_error"));
				},
			},
		);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 w-80">
			<div>
				<label className="block text-sm font-medium mb-2">
					{t("username")}
				</label>
				<Input
					placeholder={t("username")}
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					className="w-full p-2 bg-indigo-50"
					required
					disabled={isPending}
				/>
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">{t("password")}</label>
				<div className="relative">
					<Input
						placeholder={t("password")}
						type={showPassword ? "text" : "password"}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full p-2 bg-indigo-50"
						required
						disabled={isPending}
					/>
					<button
						type="button"
						onClick={() => setShowPassword((v) => !v)}
						className="absolute right-2 top-1/2 -translate-y-1/2"
					>
						{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
					</button>
				</div>
			</div>

			<button
				type="submit"
				disabled={isPending}
				className=" bg-indigo-900 text-white px-3 py-1 rounded-[3px] hover:bg-indigo-800 disabled:bg-gray-400"
			>
				{isPending ? t("logging_in") : t("login")}
			</button>
		</form>
	);
}
