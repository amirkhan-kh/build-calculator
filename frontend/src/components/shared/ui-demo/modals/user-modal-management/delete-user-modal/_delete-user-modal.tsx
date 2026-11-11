"use client";

import { Trash2 } from "lucide-react";
import { ConfirmDialog, deleteTriggerClass } from "@/components/shared/kit/confirm-dialog";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useDeleteUser } from "@/action/hooks/users-hook/user-delete.hook";

interface Props {
	userId: number | string;
	username: string;
}

const DeleteUserManagement: React.FC<Props> = ({ userId, username }) => {
	const [open, setOpen] = useState(false);
	const deleteMutation = useDeleteUser();
	const t = useTranslations("management");
	const tc = useTranslations("common");

	const handleDelete = () => {
		deleteMutation.mutate(userId, {
			onSuccess: () => {
				setOpen(false);
			},
		});
	};

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={setOpen}
			title={t("delete_user_title")}
			description={t("delete_user_confirm", { username })}
			onConfirm={handleDelete}
			pending={deleteMutation.isPending}
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

export default DeleteUserManagement;
