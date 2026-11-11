"use client";

import { useCreateBuilding } from "@/action/hooks/buildings-hook/create-building";
import { useComplexes } from "@/action/hooks/complex-hook/get-complexes";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
	DialogHeader,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/shared/kit/field";
import { Segmented } from "@/components/shared/kit/segmented";
import { Loader2, Plus } from "lucide-react";
import type { IComplex } from "@/types/complex.types";
import { FC, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type PriceUnit = "UZS" | "USD";
type ModalProps = {
	onSuccess?: () => void;
	defaultComplexId?: number | string;
};

export const ModalAddedBuilding: FC<ModalProps> = ({
	onSuccess,
	defaultComplexId,
}) => {
	const { data: complexesRaw = [] } = useComplexes();
	const complexes = (complexesRaw || []) as IComplex[];

	const createMutation = useCreateBuilding();
	const t = useTranslations("building");
	const tc = useTranslations("common");

	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		floor_count: "",
		base_price: "",
		price_unit: "UZS" as PriceUnit,
		max_coefficient: "",
		complex_id: defaultComplexId ? String(defaultComplexId) : "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name === "max_coefficient") {
			if (value === "") {
				setFormData((prev) => ({ ...prev, max_coefficient: "" }));
				return;
			}
			if (/^\d*\.?\d*$/.test(value)) {
				const num = Number(value);
				if (num >= 0 && num <= 100)
					setFormData((prev) => ({ ...prev, max_coefficient: value }));
			}
			return;
		}
		if (name === "floor_count") {
			if (value === "") {
				setFormData((prev) => ({ ...prev, floor_count: "" }));
				return;
			}
			if (/^\d+$/.test(value)) {
				const num = Number(value);
				if (num >= 0 && num <= 100)
					setFormData((prev) => ({ ...prev, floor_count: value }));
			}
			return;
		}
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) return toast.error(t("enter_name"));
		if (!formData.complex_id) return toast.error(t("select_complex_error"));

		const buildingData = {
			name: formData.name,
			floor_count: Number(formData.floor_count) || 1,
			base_price: Number(formData.base_price) || 0,
			price_unit: formData.price_unit,
			max_coefficient: Number(formData.max_coefficient) || 1,
			complex_id: Number(formData.complex_id),
		};

		try {
			await createMutation.mutateAsync(buildingData);

			toast.success(t("added_success"));
			setOpen(false);
			setFormData({
				name: "",
				floor_count: "",
				base_price: "",
				price_unit: "UZS",
				max_coefficient: "",
				complex_id: defaultComplexId ? String(defaultComplexId) : "",
			});

			if (onSuccess) onSuccess();
		} catch (error) {
			toast.error(t("add_error"));
		}
	};

	const pending = createMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					{t("add_btn")}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>{t("add_title")}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{!defaultComplexId && (
						<Field label={t("complex_label")} required className="sm:col-span-2">
							<Select
								value={formData.complex_id}
								onValueChange={(v) => setFormData((prev) => ({ ...prev, complex_id: v }))}
								disabled={pending}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("select_complex")} />
								</SelectTrigger>
								<SelectContent>
									{complexes.map((item) => (
										<SelectItem key={item.id} value={String(item.id)}>
											{item.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
					)}

					<Field label={t("name_label")} htmlFor="building-name" required className="sm:col-span-2">
						<Input
							id="building-name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder={t("enter_name")}
							required
							disabled={pending}
							autoFocus
						/>
					</Field>

					<Field label={t("floors_label")} htmlFor="building-floors" required>
						<Input
							id="building-floors"
							name="floor_count"
							type="text"
							inputMode="numeric"
							value={formData.floor_count}
							onChange={handleChange}
							placeholder="5"
							required
							disabled={pending}
						/>
					</Field>

					<Field label={t("max_coef_label")} htmlFor="building-coef" required>
						<Input
							id="building-coef"
							name="max_coefficient"
							type="text"
							inputMode="decimal"
							value={formData.max_coefficient}
							onChange={handleChange}
							placeholder="1.5"
							required
							disabled={pending}
						/>
					</Field>

					<Field label={t("base_price_label")} htmlFor="building-price" required className="sm:col-span-2">
						<div className="flex gap-2">
							<Input
								id="building-price"
								name="base_price"
								type="number"
								min="0"
								step="0.01"
								value={formData.base_price}
								onChange={handleChange}
								placeholder="1000000"
								required
								disabled={pending}
								className="flex-1"
							/>
							<Segmented
								value={formData.price_unit}
								onChange={(v) => setFormData((prev) => ({ ...prev, price_unit: v }))}
								options={[
									{ value: "UZS", label: "UZS" },
									{ value: "USD", label: "USD" },
								]}
							/>
						</div>
					</Field>

					<DialogFooter className="pt-2 sm:col-span-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={pending}
						>
							{tc("cancel")}
						</Button>
						<Button type="submit" disabled={pending}>
							{pending && <Loader2 className="animate-spin" />}
							{pending ? tc("adding") : tc("add")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
