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
import { useRouter } from "next/navigation";
import { QueryKeys } from "@/lib/query-keys";
import type { PropsModalaUpdateCoefficientTypeApartment } from "@/types/props.types";

export function ModalaUpdateCoefficientTypeApartment({
	coefficientType,
	buildingId,
	coefficientId,
}: PropsModalaUpdateCoefficientTypeApartment) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [rate, setRate] = useState("");
	const apartmentKey = QueryKeys.apartments.all;
	const { mutate, isPending } = useUpdateCoefficientType(
		buildingId,
		apartmentKey,
	);
	const t = useTranslations("coefficient");
	const tc = useTranslations("common");

	const router = useRouter();
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
					rate: Number(rate),
					coefficient_id: coefficientId,
				},
			},
			{
				onSuccess: () => {
					setOpen(false);
					router.refresh();
				},
			},
		);
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
					aria-label={tc("edit")}
				>
					<Pencil size={15} />
				</button>
			</DialogTrigger>

			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>{t("edit_title")}</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
					className="flex flex-col gap-4"
				>
					<Field label={t("field_name")} htmlFor="ucta-name" required>
						<Input id="ucta-name" value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} />
					</Field>
					<Field label={t("field_value")} htmlFor="ucta-rate" required>
						<Input
							id="ucta-rate"
							inputMode="decimal"
							value={rate}
							onChange={(e) => setRate(e.target.value)}
							disabled={isPending}
						/>
					</Field>
					<DialogFooter className="pt-1">
						<Button type="button" variant="outline" onClick={() => setOpen(false)}>
							{tc("cancel")}
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending && <Loader2 className="animate-spin" />}
							{tc("save")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
