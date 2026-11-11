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
import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePostRole } from "@/action/hooks/roles-hook/use-post-role";
import { usePermissions } from "@/action/hooks/permissions-hook/use-permissions-hook";
import { Field } from "@/components/shared/kit/field";
import type { ICreateRolePayload } from "@/types/role.types";
import { PermissionPicker } from "../_permission-picker";

const CreateRole: React.FC = () => {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
	const t = useTranslations("management");
	const tc = useTranslations("common");

	const { data: permissions, isLoading: permsLoading } = usePermissions();
	const { mutate: createRole, isPending } = usePostRole();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!name.trim()) return;

		const payload: ICreateRolePayload = {
			name,
			permission_ids: selectedPermissionIds,
		};

		createRole(payload, {
			onSuccess: (res) => {
				if (!res._meta) {
					setOpen(false);
					setName("");
					setSelectedPermissionIds([]);
				}
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					{t("create_role_btn")}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{t("new_role_title")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<Field label={t("role_name_label")} htmlFor="role-name" required>
						<Input
							id="role-name"
							required
							autoFocus
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t("role_name_placeholder")}
						/>
					</Field>

					<PermissionPicker
						permissions={permissions}
						loading={permsLoading}
						selected={selectedPermissionIds}
						onChange={setSelectedPermissionIds}
					/>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
							{tc("cancel")}
						</Button>
						<Button type="submit" disabled={isPending || permsLoading || !name.trim()}>
							{isPending && <Loader2 className="animate-spin" />}
							{tc("create")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateRole;
