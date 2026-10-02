"use client";

import { useDeleteApartment } from "@/action/hooks/apartments-hook/delete-aparment.hook";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { ModalDeleteApartmentsProps } from "@/types/props.types";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdOutlineDeleteForever } from "react-icons/md";
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
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button className="text-gray-200 hover:text-white bg-indigo-900 px-3 py-1 rounded-[3px]">
					<MdOutlineDeleteForever />
				</button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogTitle className="text-lg font-semibold text-center mb-4">
					{t("delete_title")}
				</DialogTitle>
				<div className="space-y-4">
					<p className="text-center text-gray-600">
						{t("delete_confirm")}
					</p>
					<div className="flex justify-center gap-3">
						<button
							onClick={() => setOpen(false)}
							className="px-6 bg-gray-400 text-white  py-0.5 rounded-sm"
						>
							{tc("cancel")}
						</button>
						<button
							onClick={handleDelete}
							className="px-6 bg-red-400 text-white  py-0.5 rounded-sm"
						>
							{tc("delete")}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
