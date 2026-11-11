"use client";

import { Trash2 } from "lucide-react";
import { ConfirmDialog, deleteTriggerClass } from "@/components/shared/kit/confirm-dialog";
import { useDeleteApartment } from "@/action/hooks/apartments-hook/delete-aparment.hook";
import type { ModalDeleteApartmentsProps } from "@/types/props.types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function ModalDeleteApartments({
	apartmentId,
	buildingId,
	onSuccess,
}: ModalDeleteApartmentsProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const deleteMutation = useDeleteApartment();
	const t = useTranslations("apartment");
	const tc = useTranslations("common");

	const handleDelete = async () => {
		try {
			const result = await deleteMutation.mutateAsync({ id: Number(apartmentId) });
			if (!result.success) return;
			setOpen(false);

			if (onSuccess) {
				onSuccess();
				router.refresh();
			} else if (buildingId) {
				router.push(`/buildings/${buildingId}`);
			} else {
				router.back();
			}
		} catch (e) {
			toast.error(t("delete_error"));
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
