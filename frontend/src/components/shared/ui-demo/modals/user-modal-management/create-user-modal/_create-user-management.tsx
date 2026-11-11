"use client";

import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePostUser } from "@/action/hooks/users-hook/user-post.hook";
import { useRoles } from "@/action/hooks/roles-hook/use-roles";
import { Field } from "@/components/shared/kit/field";
import type { IUser } from "@/types/user.types";

interface ICreateUserPayload extends Omit<IUser, "id"> {
	password: string;
}

const EMPTY: ICreateUserPayload = { username: "", password: "", phone: "", fullname: "", role_id: 0 };

const CreateUserManagement: React.FC = () => {
	const [open, setOpen] = useState(false);
	const [passwordError, setPasswordError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState<ICreateUserPayload>(EMPTY);
	const t = useTranslations("management");
	const tc = useTranslations("common");

	const { data: roles, isLoading: rolesLoading } = useRoles();
	const { mutate: createUser, isPending: isCreating } = usePostUser();

	const validatePassword = (value: string): string => {
		if (value.length < 6) return t("password_min_length");
		if (!/[#$%&@!^*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) return t("password_special_char");
		return "";
	};

	const set = (patch: Partial<ICreateUserPayload>) => setFormData((prev) => ({ ...prev, ...patch }));

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const error = validatePassword(formData.password);
		if (error) {
			setPasswordError(error);
			return;
		}
		if (!formData.username.trim()) return;

		createUser(formData, {
			onSuccess: () => {
				setOpen(false);
				setFormData(EMPTY);
				setPasswordError("");
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					{t("add_user_btn")}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>{t("new_user_title")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Field label={t("fullname_label")} htmlFor="fullname" required className="sm:col-span-2">
							<Input
								id="fullname"
								required
								autoFocus
								value={formData.fullname}
								onChange={(e) => set({ fullname: e.target.value })}
								placeholder={t("enter_fullname")}
							/>
						</Field>
						<Field label={t("username_label")} htmlFor="username" required>
							<Input
								id="username"
								required
								autoComplete="off"
								value={formData.username}
								onChange={(e) => set({ username: e.target.value })}
								placeholder={t("enter_username")}
							/>
						</Field>
						<Field label={t("phone_label")} htmlFor="phone" required>
							<Input
								id="phone"
								type="tel"
								required
								value={formData.phone}
								onChange={(e) => set({ phone: e.target.value })}
								placeholder="+998 90 123 45 67"
							/>
						</Field>
						<Field label={t("password_label")} htmlFor="password" required error={passwordError || undefined}>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									required
									autoComplete="new-password"
									value={formData.password}
									onChange={(e) => {
										set({ password: e.target.value });
										setPasswordError(validatePassword(e.target.value));
									}}
									placeholder={t("enter_password")}
									aria-invalid={!!passwordError}
									className="pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
									tabIndex={-1}
								>
									{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
								</button>
							</div>
						</Field>
						<Field label={t("role_label")}>
							<Select
								value={formData.role_id ? String(formData.role_id) : undefined}
								onValueChange={(value) => set({ role_id: Number(value) })}
								disabled={rolesLoading}
							>
								<SelectTrigger>
									<SelectValue placeholder={rolesLoading ? t("loading_roles") : t("select_role")} />
								</SelectTrigger>
								<SelectContent>
									{roles?.map((role) => (
										<SelectItem key={role.id} value={role.id.toString()}>
											{role.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>
							{tc("cancel")}
						</Button>
						<Button type="submit" disabled={isCreating || rolesLoading}>
							{isCreating && <Loader2 className="animate-spin" />}
							{isCreating ? tc("creating") : tc("create")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateUserManagement;
