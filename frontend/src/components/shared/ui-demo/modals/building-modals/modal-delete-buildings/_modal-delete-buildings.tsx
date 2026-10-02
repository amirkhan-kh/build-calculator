"use client";

import {
	Dialog,
	DialogContent,
	DialogTrigger,
	DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { MdOutlineDeleteForever } from "react-icons/md";
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
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button
					className="bg-gradient-to-br from-indigo-100 to-white hover:bg-gray-200 px-2 py-1 rounded-[3px] transition-colors"
					disabled={deleteMutation.isPending}
				>
					<MdOutlineDeleteForever
						size={20}
						className={`${deleteMutation.isPending ? "text-gray-400" : "text-gray-600"}`}
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
							className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors min-w-[80px]"
							disabled={deleteMutation.isPending}
						>
							{tc("no")}
						</button>
						<button
							onClick={handleDelete}
							disabled={deleteMutation.isPending}
							className="px-4 py-2 bg-red-300 text-white rounded hover:bg-red-400 transition-colors disabled:opacity-50 min-w-[80px]"
						>
							{deleteMutation.isPending ? tc("deleting") : tc("yes")}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
