"use client";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { Field } from "@/components/shared/kit/field";
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
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (next) {
					setName(coefficientType.name);
					setRate(String(coefficientType.rate));
				}
				setOpen(next);
			}}
		>
			<DialogTrigger asChild>
				<button
					type="button"
					className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
					title={tc("edit")}
					aria-label={tc("edit")}
				>
					<Pencil size={15} />
				</button>
			</DialogTrigger>

			<DialogContent className="max-w-sm" onKeyDown={handleKeyDown}>
				<DialogHeader>
					<DialogTitle>{t("edit_title")}</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<Field label={t("edit_name_label")} htmlFor="coefficient-name" required>
						<Input
							id="coefficient-name"
							placeholder={t("edit_name_placeholder")}
							value={name}
							onChange={(e) => setName(e.target.value)}
							disabled={isPending}
						/>
					</Field>

					<Field
						label={t("edit_rate_label")}
						htmlFor="coefficient-rate"
						required
						hint={t("edit_rate_hint")}
					>
						<Input
							id="coefficient-rate"
							type="text"
							inputMode="decimal"
							placeholder={t("edit_rate_placeholder")}
							value={rate}
							onChange={handleRateChange}
							disabled={isPending}
						/>
					</Field>

					<DialogFooter className="pt-1">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isPending}
						>
							{tc("cancel")}
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={isPending || !name.trim() || !rate.trim()}
						>
							{isPending && <Loader2 className="animate-spin" />}
							{isPending ? tc("saving") : tc("save")}
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}
