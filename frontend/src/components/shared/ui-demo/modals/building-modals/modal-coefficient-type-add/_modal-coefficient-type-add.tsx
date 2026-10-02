"use client";
import { useCreateCoefficientType } from "@/action/hooks/coefficient-type-hook/create-coefficient-type";
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

interface ModalAddedCoefficientTypeProps {
	buildingId: number;
	coefficientId: number;
	onSuccess?: () => void;
}
export const ModalAddedCoefficientType = ({
	buildingId,
	coefficientId,
	onSuccess,
}: ModalAddedCoefficientTypeProps) => {
	const [open, setOpen] = useState(false);
	const createCoefficientType = useCreateCoefficientType();
	const [typeName, setTypeName] = useState("");
	const [rate, setRate] = useState<number | "">("");
	const t = useTranslations("coefficient");
	const tc = useTranslations("common");

	const handleCreateCoefficientType = async () => {
		if (!typeName || rate === "") {
			toast.error(t("fill_fields_error"));
			return;
		}
		await createCoefficientType.mutateAsync({
			name: typeName.trim(),
			rate: Number(rate),
			coefficient_id: coefficientId,
			building_id: buildingId,
		});
		toast.success(t("type_created_success"));
		setTypeName("");
		setRate("");
		setOpen(false);
		onSuccess?.();
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button className="bg-[#46479f] px-3 py-1 rounded text-white text-sm">
					{t("type_create_btn")}
				</button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("type_create_title")}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<Input
						value={typeName}
						onChange={(e) => setTypeName(e.target.value)}
						placeholder={t("type_name_placeholder")}
					/>
					<Input
						type="number"
						value={rate}
						min={0}
						max={100}
						step={1}
						placeholder={t("type_rate_placeholder")}
						className="bg-white"
						onChange={(e) => {
							const raw = e.target.value;
							if (raw === "") {
								setRate("");
								return;
							}
							const value = Number(raw);
							if (value < 0 || value > 100) return;
							setRate(value);
						}}
					/>
					<button
						className="bg-[#46479f] text-white px-4 py-1 rounded"
						onClick={handleCreateCoefficientType}
					>
						{tc("create")}
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
