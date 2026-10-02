"use client";

import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
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
import { PlusCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePostUser } from "@/action/hooks/users-hook/user-post.hook";
import { useRoles } from "@/action/hooks/roles-hook/use-roles";
import type { IUser } from "@/types/user.types";

interface ICreateUserPayload extends Omit<IUser, "id"> {
	password: string;
}

const CreateUserManagement: React.FC = () => {
	const [open, setOpen] = useState<boolean>(false);
	const [passwordError, setPasswordError] = useState<string>("");
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [formData, setFormData] = useState<ICreateUserPayload>({
		username: "",
		password: "",
		phone: "",
		fullname: "",
		role_id: 0,
	});
	const t = useTranslations("management");
	const tc = useTranslations("common");

	const { data: roles, isLoading: rolesLoading } = useRoles();
	const { mutate: createUser, isPending: isCreating } = usePostUser();

	const validatePassword = (value: string): string => {
		const minLength = value.length >= 6;
		const hasSpecialChar = /[#$%&@!^*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

		if (!minLength) return t("password_min_length");
		if (!hasSpecialChar) return t("password_special_char");
		return "";
	};

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
				setFormData({ username: "", password: "", role_id: 0 });
				setPasswordError("");
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="bg-indigo-900 hover:bg-indigo-800 text-white gap-2">
					<PlusCircle size={18} />
					<span>{t("add_user_btn")}</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-96">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold">
						{t("new_user_title")}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					<div className="space-y-2">
						<label>{t("username_label")}</label>
						<Input
							id="username"
							required
							value={formData.username}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, username: e.target.value })
							}
							placeholder={t("enter_username")}
						/>
					</div>
					<div className="space-y-2">
						<label>{t("fullname_label")}</label>
						<Input
							id="fullname"
							required
							value={formData.fullname}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, fullname: e.target.value })
							}
							placeholder={t("enter_fullname")}
						/>
					</div>
					<div className="space-y-2">
						<label>{t("phone_label")}</label>
						<Input
							id="phone"
							required
							value={formData.phone}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, phone: e.target.value })
							}
							placeholder={t("enter_phone")}
						/>
					</div>
					<div className="space-y-2">
						<label>{t("password_label")}</label>
						<div className="relative">
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								required
								value={formData.password}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									const value = e.target.value;
									setFormData({ ...formData, password: value });
									setPasswordError(validatePassword(value));
								}}
								placeholder={t("enter_password")}
								className={`pr-10 ${passwordError ? "border-red-500 focus:border-red-500" : ""}`}
							/>
							<button
								type="button"
								onClick={() => setShowPassword((prev) => !prev)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
							>
								{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
					</div>

					{passwordError && (
						<p className="text-sm text-red-500">{passwordError}</p>
					)}

					<div className="space-y-2">
						<label>{t("role_label")}</label>
						<Select
							value={formData.role_id?.toString()}
							onValueChange={(value: string) =>
								setFormData({ ...formData, role_id: Number(value) })
							}
							disabled={rolesLoading}
						>
							<SelectTrigger>
								<SelectValue
									placeholder={rolesLoading ? t("loading_roles") : t("select_role")}
								/>
							</SelectTrigger>
							<SelectContent>
								{rolesLoading && (
									<div className="flex justify-center p-2">
										<Loader2 className="animate-spin h-4 w-4" />
									</div>
								)}
								{roles?.map((role) => (
									<SelectItem key={role.id} value={role.id.toString()}>
										{role.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isCreating}
						>
							{tc("cancel")}
						</Button>
						<Button
							type="submit"
							className="bg-indigo-900 hover:bg-indigo-800 text-white"
							disabled={isCreating || rolesLoading}
						>
							{isCreating ? tc("creating") : tc("create")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateUserManagement;
