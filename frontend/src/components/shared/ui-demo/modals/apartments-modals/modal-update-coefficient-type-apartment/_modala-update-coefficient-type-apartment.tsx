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
import { MdEdit } from "react-icons/md";
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

	useEffect(() => {
		if (open) {
			setName(coefficientType.name);
			setRate(String(coefficientType.rate));
		}
	}, [open, coefficientType]);

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
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button className="px-3 py-1 flex gap-1.5 items-center bg-gradient-to-r from-indigo-50/20 to-white border border-indigo-200 rounded-sm text-sm font-medium text-indigo-700">
					<MdEdit size={16} />
				</button>
			</DialogTrigger>

			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>{t("edit_title")}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<Input
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder={t("field_name")}
						disabled={isPending}
					/>

					<Input
						value={rate}
						onChange={(e) => setRate(e.target.value)}
						placeholder={t("field_value")}
						disabled={isPending}
					/>

					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setOpen(false)}>
							{tc("cancel")}
						</Button>
						<Button onClick={handleSubmit} disabled={isPending}>
							{tc("save")}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
