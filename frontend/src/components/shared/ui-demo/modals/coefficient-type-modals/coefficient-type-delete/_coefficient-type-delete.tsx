"use client";

import { Trash2 } from "lucide-react";
import { ConfirmDialog, deleteTriggerClass } from "@/components/shared/kit/confirm-dialog";
import { useDeleteCoefficientType } from "@/action/hooks/coefficient-type-hook/delete-coefficient-type";
import type { ModalDeleteCoefficientTypeProps } from "@/types/props.types";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function ModalDeleteCoefficientType({
	coefficientTypeId,
	buildingId,
	onSuccess,
}: ModalDeleteCoefficientTypeProps) {
	const [open, setOpen] = useState(false);
	const t = useTranslations("coefficient");
	const tc = useTranslations("common");

	const deleteMutation = useDeleteCoefficientType(buildingId);

	const handleDelete = async () => {
		try {
			await deleteMutation.mutateAsync({ id: coefficientTypeId });
			toast.success(t("deleted_success"));
			setOpen(false);
			onSuccess?.();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={setOpen}
			title={t("delete_title")}
			description={t("delete_confirm")}
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
}
