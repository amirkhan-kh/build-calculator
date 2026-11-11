"use client";
import { useCreateCoefficientType } from "@/action/hooks/coefficient-type-hook/create-coefficient-type";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shared/kit/field";
import { Loader2, Plus } from "lucide-react";
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

	const handleCreateCoefficientType = async (e: React.FormEvent) => {
		e.preventDefault();
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

	const pending = createCoefficientType.isPending;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Plus />
					{t("type_create_btn")}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>{t("type_create_title")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleCreateCoefficientType} className="flex flex-col gap-4">
					<Field label={t("type_name_label")} htmlFor="coef-type-name" required>
						<Input
							id="coef-type-name"
							value={typeName}
							onChange={(e) => setTypeName(e.target.value)}
							placeholder={t("type_name_placeholder")}
							disabled={pending}
							autoFocus
						/>
					</Field>
					<Field label={t("type_rate_label")} htmlFor="coef-type-rate" required>
						<Input
							id="coef-type-rate"
							type="number"
							value={rate}
							min={0}
							max={100}
							step={1}
							placeholder="0–100"
							disabled={pending}
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
					</Field>
					<DialogFooter className="pt-1">
						<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
							{tc("cancel")}
						</Button>
						<Button type="submit" disabled={pending || !typeName.trim() || rate === ""}>
							{pending && <Loader2 className="animate-spin" />}
							{tc("create")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
