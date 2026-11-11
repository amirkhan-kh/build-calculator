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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePatchUser } from "@/action/hooks/users-hook/user-patch.hook";
import { Field } from "@/components/shared/kit/field";
import type { IUser } from "@/types/user.types";

interface IUpdateUserFields extends Partial<IUser> {
	password?: string;
}

interface Props {
	user: IUser;
}

const PatchUserManagement: React.FC<Props> = ({ user }) => {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState<IUpdateUserFields>({ username: user.username, password: "" });
	const t = useTranslations("management");
	const tc = useTranslations("common");

	const { mutate: updateUser, isPending } = usePatchUser();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const payload: IUpdateUserFields = {};
		if (formData.username && formData.username !== user.username) payload.username = formData.username;
		if (formData.password && formData.password.trim() !== "") payload.password = formData.password;

		if (Object.keys(payload).length === 0) {
			setOpen(false);
			return;
		}

		updateUser(
			{ id: user.id, data: payload as Partial<IUser> },
			{ onSuccess: () => setOpen(false) },
		);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (next) {
					setFormData({ username: user.username, password: "" });
				}
				setOpen(next);
			}}
		>
			<DialogTrigger asChild>
				<button
					type="button"
					className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
					title={tc("edit")}
					aria-label={tc("edit")}
				>
					<Pencil size={15} />
				</button>
			</DialogTrigger>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>{t("edit_profile_title")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<Field label={t("new_username_label")} htmlFor={`edit-username-${user.id}`}>
						<Input
							id={`edit-username-${user.id}`}
							value={formData.username ?? ""}
							onChange={(e) => setFormData({ ...formData, username: e.target.value })}
							placeholder={t("new_username_placeholder")}
							autoComplete="username"
						/>
					</Field>
					<Field
						label={t("new_password_label")}
						htmlFor={`edit-password-${user.id}`}
						hint={t("new_password_placeholder")}
					>
						<Input
							id={`edit-password-${user.id}`}
							type="password"
							value={formData.password ?? ""}
							onChange={(e) => setFormData({ ...formData, password: e.target.value })}
							placeholder="••••••"
							autoComplete="new-password"
						/>
					</Field>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
							{tc("cancel")}
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending && <Loader2 className="animate-spin" />}
							{isPending ? tc("saving") : t("save_changes_btn")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default PatchUserManagement;
