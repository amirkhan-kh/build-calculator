"use client";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useUpdateCoefficientType } from "@/action/hooks/coefficient-type-hook/update-coefficient-type";
import type { PropsModalEditCoefficientType } from "@/types/props.types";

export function ModalEditCoefficientType({
	coefficientType,
	buildingId,
	coefficientId,
}: PropsModalEditCoefficientType) {
	const [name, setName] = useState("");
	const [rate, setRate] = useState<string>("");
	const [open, setOpen] = useState(false);
	const { mutate, isPending } = useUpdateCoefficientType(buildingId);
	const t = useTranslations("coefficient");
	const tc = useTranslations("common");

	useEffect(() => {
		if (open) {
			setName(coefficientType.name);
			setRate(String(coefficientType.rate));
		}
	}, [open, coefficientType]);

	const handleSubmit = () => {
		if (!name.trim() || !rate.trim()) {
			toast.error(t("fill_fields_error2"));
			return;
		}
		mutate(
			{
				id: coefficientType.id,
				data: {
					name: name.trim(),
					rate: rate,
					coefficient_id: coefficientId,
				},
			},
			{
				onSuccess: () => setOpen(false),
			},
		);
	};
	const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === "" || /^\d*\.?\d*$/.test(value)) {
			setRate(value);
		}
	};
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button
					className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
					title={tc("edit")}
				>
					<MdOutlineModeEditOutline size={22} />
				</button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-96" onKeyDown={handleKeyDown}>
				<DialogHeader>
					<DialogTitle className="text-lg font-semibold">
						{t("edit_title")}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 pt-4">
					<div className="space-y-2">
						<label htmlFor="coefficient-name" className="text-sm font-medium">
							{t("edit_name_label")}
						</label>
						<Input
							id="coefficient-name"
							placeholder={t("edit_name_placeholder")}
							value={name}
							onChange={(e) => setName(e.target.value)}
							disabled={isPending}
							className="w-full"
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="coefficient-rate" className="text-sm font-medium">
							{t("edit_rate_label")}
						</label>
						<Input
							id="coefficient-rate"
							type="text"
							placeholder={t("edit_rate_placeholder")}
							value={rate}
							onChange={handleRateChange}
							disabled={isPending}
							className="w-full"
						/>
						<p className="text-xs text-gray-500">{t("edit_rate_hint")}</p>
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isPending}
							className="min-w-20"
						>
							{tc("cancel")}
						</Button>

						<Button
							onClick={handleSubmit}
							disabled={isPending || !name.trim() || !rate.trim()}
							className="min-w-24 bg-indigo-600 hover:bg-indigo-700"
						>
							{isPending ? (
								<span className="flex items-center gap-2">
									<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
									{tc("saving")}
								</span>
							) : (
								tc("save")
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
