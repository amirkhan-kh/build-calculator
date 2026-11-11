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
import type { IPermission } from "@/types/permissions.types";
import { usePatchPermission } from "@/action/hooks/permissions-hook/use-patch-permission-hook";
import { Field } from "@/components/shared/kit/field";

interface Props {
	permission: IPermission;
}

const PatchPermissionManagement: React.FC<Props> = ({ permission }) => {
	const [open, setOpen] = useState(false);
	const [codename, setCodename] = useState(permission.codename);

	const { mutate: updatePermission, isPending } = usePatchPermission();
	const t = useTranslations("management");
	const tc = useTranslations("common");

	const unchanged = !codename.trim() || codename === permission.codename;

	const handleUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		if (unchanged) return;

		updatePermission(
			{
				id: permission.id,
				data: { codename: codename.trim().toLowerCase().replace(/\s+/g, "_") },
			},
			{
				onSuccess: (res) => {
					if (!res._meta) setOpen(false);
				},
			},
		);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (next) {
					setCodename(permission.codename);
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
					<DialogTitle>{t("patch_permission_title")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleUpdate} className="flex flex-col gap-5">
					<Field label={t("patch_codename_label")} htmlFor={`perm-${permission.id}`} required>
						<Input
							id={`perm-${permission.id}`}
							required
							value={codename}
							onChange={(e) => setCodename(e.target.value)}
							disabled={isPending}
							placeholder={t("patch_permission_placeholder")}
							className="font-mono lowercase"
						/>
					</Field>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
							{tc("cancel")}
						</Button>
						<Button type="submit" disabled={isPending || unchanged}>
							{isPending && <Loader2 className="animate-spin" />}
							{tc("update")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default PatchPermissionManagement;
