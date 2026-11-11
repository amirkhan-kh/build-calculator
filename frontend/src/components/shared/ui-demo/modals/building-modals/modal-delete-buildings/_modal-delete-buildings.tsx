"use client";

import { Trash2 } from "lucide-react";
import { ConfirmDialog, deleteTriggerClass } from "@/components/shared/kit/confirm-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDeleteBuilding } from "@/action/hooks/buildings-hook/delete-building";

interface ModalDeleteBuildingsProps {
	buildingId: string | number;
	complexId?: number;
	onSuccess?: () => void;
}

export function ModalDeleteBuildings({
	buildingId,
	complexId,
	onSuccess,
}: ModalDeleteBuildingsProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const t = useTranslations("building");
	const tc = useTranslations("common");

	const deleteMutation = useDeleteBuilding();

	const handleDelete = async () => {
		try {
			const result = await deleteMutation.mutateAsync({ id: Number(buildingId) });
			if (!result.success) return;
			setOpen(false);
			toast.success(t("deleted_success"));

			if (onSuccess) {
				onSuccess();
				router.refresh();
			} else if (complexId) {
				router.push(`/complex/${complexId}`);
			} else {
				router.push("/");
			}
		} catch (error) {
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
