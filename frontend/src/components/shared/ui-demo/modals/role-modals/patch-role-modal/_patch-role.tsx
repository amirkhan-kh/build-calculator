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
import { usePatchRole } from "@/action/hooks/roles-hook/use-patch-role";
import { usePermissions } from "@/action/hooks/permissions-hook/use-permissions-hook";
import { Field } from "@/components/shared/kit/field";
import type { IPatchRolePayload } from "@/types/permissions.types";
import type { PropsPatchRoleManagement } from "@/types/props.types";
import { PermissionPicker } from "../_permission-picker";

const PatchRoleManagement: React.FC<PropsPatchRoleManagement> = ({ role }) => {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(role.name);
	const [selectedIds, setSelectedIds] = useState<number[]>([]);

	const { data: allPermissions, isLoading: permsLoading } = usePermissions();
	const { mutate: updateRole, isPending } = usePatchRole();
	const t = useTranslations("management");
	const tc = useTranslations("common");

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		const payload: IPatchRolePayload = { name, permission_ids: selectedIds };
		updateRole(
			{ id: role.id, payload },
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
					setSelectedIds(role.permissions?.map((p) => p.id) ?? []);
					setName(role.name);
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
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{t("edit_role_title")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSave} className="flex flex-col gap-5">
					<Field label={t("role_name_label")} htmlFor={`role-name-${role.id}`} required>
						<Input
							id={`role-name-${role.id}`}
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t("role_name_placeholder")}
						/>
					</Field>

					<PermissionPicker
						permissions={allPermissions}
						loading={permsLoading}
						selected={selectedIds}
						onChange={setSelectedIds}
					/>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
							{tc("cancel")}
						</Button>
						<Button type="submit" disabled={isPending || !name.trim()}>
							{isPending && <Loader2 className="animate-spin" />}
							{tc("save")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default PatchRoleManagement;
