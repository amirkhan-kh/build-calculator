"use client";

import { useDeleteCoefficientType } from "@/action/hooks/coefficient-type-hook/delete-coefficient-type";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
	DialogTitle,
} from "@/components/ui/dialog";
import type { ModalDeleteCoefficientTypeProps } from "@/types/props.types";
import { useState } from "react";
import { MdOutlineDeleteForever } from "react-icons/md";
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
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button
					className="bg-gradient-to-br from-indigo-100 to-white hover:bg-gray-200 px-2 py-1 rounded-[3px]"
					disabled={deleteMutation.isPending}
				>
					<MdOutlineDeleteForever
						size={20}
						className={
							deleteMutation.isPending ? "text-gray-400" : "text-gray-500"
						}
					/>
				</button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogTitle className="text-lg font-semibold text-center">
					{t("delete_title")}
				</DialogTitle>

				<div className="py-4">
					<p className="text-center text-gray-600 mb-6">
						{t("delete_confirm")}
					</p>

					<div className="flex justify-center gap-4">
						<button
							onClick={() => setOpen(false)}
							disabled={deleteMutation.isPending}
							className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 min-w-[80px]"
						>
							{tc("no")}
						</button>

						<button
							onClick={handleDelete}
							disabled={deleteMutation.isPending}
							className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 min-w-[80px]"
						>
							{deleteMutation.isPending ? tc("deleting") : tc("yes")}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
