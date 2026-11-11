"use client";

import { useState, FormEvent } from "react";
import { Eye, EyeOff, Loader2, Lock, LogIn, User } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shared/kit/field";
import { useLogin } from "@/action/hooks/login-hook/useLogin";

export function LoginForm() {
	const router = useRouter();
	const t = useTranslations("auth");

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

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
		<form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
			<Field label={t("username")} htmlFor="login-username">
				<div className="relative">
					<User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<Input
						id="login-username"
						name="username"
						type="text"
						autoComplete="username"
						autoFocus
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="h-11 pl-9"
						required
						disabled={isPending}
					/>
				</div>
			</Field>

			<Field label={t("password")} htmlFor="login-password">
				<div className="relative">
					<Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<Input
						id="login-password"
						name="password"
						type={showPassword ? "text" : "password"}
						autoComplete="current-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="h-11 pl-9 pr-11"
						required
						disabled={isPending}
					/>
					<button
						type="button"
						onClick={() => setShowPassword((v) => !v)}
						className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
						tabIndex={-1}
					>
						{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
					</button>
				</div>
			</Field>

			<Button type="submit" size="lg" disabled={isPending} className="mt-2 h-11 w-full">
				{isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
				{isPending ? t("logging_in") : t("login")}
			</Button>
		</form>
	);
}
