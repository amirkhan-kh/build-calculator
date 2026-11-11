"use client";

import { Trash2 } from "lucide-react";
import { ConfirmDialog, deleteTriggerClass } from "@/components/shared/kit/confirm-dialog";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useDeleteRole } from "@/action/hooks/roles-hook/use-delete-role";
import { PropsDeleteRole } from "@/types/props.types";

const DeleteRole: React.FC<PropsDeleteRole> = ({ roleId, roleName }) => {
	const [open, setOpen] = useState<boolean>(false);
	const { mutate: removeRole, isPending } = useDeleteRole();
	const t = useTranslations("management");
	const tc = useTranslations("common");

	const handleDelete = () => {
		removeRole(roleId, {
			onSuccess: (res) => {
				if (!res._meta) {
					setOpen(false);
				}
			},
		});
	};

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={setOpen}
			title={t("delete_role_title")}
			description={t("delete_role_confirm", { name: roleName ?? "" })}
			onConfirm={handleDelete}
			pending={isPending}
			trigger={
				<button
					type="button"
					className={deleteTriggerClass}
					aria-label={tc("delete")}
				>
					<Trash2 size={16} />
				</button>
			}
		/>
	);
};

export default DeleteRole;
