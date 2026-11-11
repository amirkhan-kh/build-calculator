"use client";
import { useDeleteComplex } from "@/action/hooks/complex-hook/delete-complex";
import { ConfirmDialog, deleteTriggerClass } from "@/components/shared/kit/confirm-dialog";
import type { ModalDeleteComplexProps } from "@/types/props.types";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function ModalDeleteComplex({ complexId, onSuccess }: ModalDeleteComplexProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const t = useTranslations("complex");
	const tc = useTranslations("common");

	const deleteMutation = useDeleteComplex();

	const handleDelete = async () => {
		try {
			await deleteMutation.mutateAsync({ id: Number(complexId) });
			setOpen(false);

			if (onSuccess) {
				onSuccess();
				router.refresh();
			} else {
				router.push("/");
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
					disabled={deleteMutation.isPending}
					aria-label={tc("delete")}
				>
					<Trash2 size={16} />
				</button>
			}
		/>
	);
}
