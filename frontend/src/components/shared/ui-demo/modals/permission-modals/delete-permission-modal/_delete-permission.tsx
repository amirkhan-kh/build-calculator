"use client";

import { Trash2 } from "lucide-react";
import { ConfirmDialog, deleteTriggerClass } from "@/components/shared/kit/confirm-dialog";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useDeletePermission } from "@/action/hooks/permissions-hook/use-delete-permission-hook";
import type { PropsDeletePermissionManagement } from "@/types/props.types";

const DeletePermissionManagement: React.FC<PropsDeletePermissionManagement> = ({
	permissionId,
	codename,
}) => {
	const [open, setOpen] = useState<boolean>(false);
	const { mutate: removePermission, isPending } = useDeletePermission();
	const t = useTranslations("management");
	const tc = useTranslations("common");

	const handleDelete = () => {
		removePermission(permissionId, {
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
			title={t("delete_permission_title")}
			description={t("delete_permission_confirm", { codename: codename ?? "" })}
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

export default DeletePermissionManagement;
