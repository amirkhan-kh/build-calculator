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

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
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

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button className="bg-indigo-600 px-4 py-2 rounded-xl text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
					{t("add_btn")}
				</button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>{t("add_title")}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
					{!defaultComplexId && (
						<div className="space-y-2">
							<label className="text-sm font-medium">{t("complex_label")}</label>
							<select
								name="complex_id"
								value={formData.complex_id}
								onChange={handleChange}
								required
								disabled={createMutation.isPending}
								className="w-full h-10 border rounded px-3 bg-white"
							>
								<option value="">{t("select_complex")}</option>
								{complexes.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</select>
						</div>
					)}

					<div className="space-y-2">
						<label className="text-sm font-medium">{t("name_label")}</label>
						<Input
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder={t("enter_name")}
							required
							disabled={createMutation.isPending}
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">{t("floors_label")}</label>
						<Input
							name="floor_count"
							type="text"
							inputMode="numeric"
							value={formData.floor_count}
							onChange={handleChange}
							placeholder="5"
							required
							disabled={createMutation.isPending}
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">{t("base_price_label")}</label>
						<Input
							name="base_price"
							type="number"
							min="0"
							step="0.01"
							value={formData.base_price}
							onChange={handleChange}
							placeholder="1000000"
							required
							disabled={createMutation.isPending}
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">
							{t("max_coef_label")}
						</label>
						<Input
							name="max_coefficient"
							type="text"
							inputMode="decimal"
							value={formData.max_coefficient}
							onChange={handleChange}
							placeholder="1.5"
							required
							disabled={createMutation.isPending}
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">{t("currency_label")}</label>
						<select
							name="price_unit"
							value={formData.price_unit}
							onChange={handleChange}
							className="w-full h-10 border rounded px-3 bg-white"
							disabled={createMutation.isPending}
						>
							<option value="UZS">UZS</option>
							<option value="USD">USD</option>
						</select>
					</div>

					<div className="col-span-2">
						<DialogFooter className="flex gap-3 pt-4 border-t">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={createMutation.isPending}
							>
								{tc("cancel")}
							</Button>
							<Button
								type="submit"
								disabled={createMutation.isPending}
								className="bg-[#282964] hover:bg-[#1f2050] text-white"
							>
								{createMutation.isPending ? tc("adding") : tc("add")}
							</Button>
						</DialogFooter>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
