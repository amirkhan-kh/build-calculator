"use client";

import { useCreateCoefficient } from "@/action/hooks/coefficient-hook/create-coefficient";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ModalAddedCoefficientNameProps {
	onSuccess?: () => void;
	buildingId: string | number;
}

export const ModalAddedCoefficientName = ({
	onSuccess,
	buildingId,
}: ModalAddedCoefficientNameProps) => {
	const [coefficientName, setCoefficientName] = useState("");
	const [open, setOpen] = useState(false);
	const { mutate: createMutation, isPending } = useCreateCoefficient();
	const t = useTranslations("coefficient");
	const tc = useTranslations("common");

	const handleCreateCoefficient = () => {
		const trimmedName = coefficientName.trim();
		if (!trimmedName) {
			toast.error(t("enter_name_error"));
			return;
		}
		createMutation(
			{
				name: trimmedName,
				building_id: Number(buildingId),
			},
			{
				onSuccess: () => {
					toast.success(t("created_success"));
					setCoefficientName("");
					setOpen(false);
					if (onSuccess) onSuccess();
				},
				onError: (error) => {
					toast.error(t("create_error"));
					console.error(error);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button className="bg-[#46479f] px-3 py-1 rounded text-white text-sm hover:bg-[#1f2050] transition-colors">
					{t("add_name_btn")}
				</button>
			</DialogTrigger>
			<DialogContent className="w-md">
				<DialogHeader>
					<DialogTitle />
				</DialogHeader>

				<div className="space-y-6">
					<label className="text-sm font-medium">{t("name_label")}</label>
					<Input
						value={coefficientName}
						onChange={(e) => setCoefficientName(e.target.value)}
						placeholder={t("name_placeholder")}
						className="bg-white w-full"
						onKeyDown={(e) => {
							if (e.key === "Enter" && !isPending) {
								handleCreateCoefficient();
							}
						}}
						disabled={isPending}
					/>
					<div className="flex justify-end">
						<button
							className="bg-[#46479f] text-white rounded-sm h-9 px-4 hover:bg-[#3a3b8a] transition-colors disabled:opacity-50"
							onClick={handleCreateCoefficient}
							disabled={isPending || !coefficientName.trim()}
						>
							{isPending ? tc("creating") : t("create_btn")}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
