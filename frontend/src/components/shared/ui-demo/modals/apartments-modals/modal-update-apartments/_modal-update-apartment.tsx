"use client";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { MdEdit } from "react-icons/md";
import { useTranslations } from "next-intl";
import { useUpdateApartment } from "@/action/hooks/apartments-hook/update-apartment.hook";
import type { ApartmentFormData, IApartment } from "@/types/apartment.types";
import type { PropsModalUpdateApartments } from "@/types/props.types";
import { StatusUpdateCell } from "../../../patch-status/_status-pach";

interface ApiError {
	message: string;
	detail?: string;
}

export function ModalUpdateApartments({
	apartment,
}: PropsModalUpdateApartments) {
	const [open, setOpen] = useState(false);
	const updateMutation = useUpdateApartment();
	const t = useTranslations("apartment");
	const tc = useTranslations("common");

	const [formData, setFormData] = useState<ApartmentFormData>({
		number: apartment.number ?? "",
		floor: apartment.floor ?? 0,
		room_count: apartment.room_count ?? 0,
		area: apartment.area ?? "",
		final_price: apartment.final_price ?? "",
		status: apartment.status ?? "free",
	});
	const handleOpenChange = (value: boolean) => {
		setOpen(value);

		if (value) {
			setFormData({
				number: apartment.number ?? "",
				floor: apartment.floor ?? 0,
				room_count: apartment.room_count ?? 0,
				area: apartment.area ?? "",
				final_price: apartment.final_price ?? "",
				status: apartment.status ?? "free",
			});
		}
	};
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const payload: Partial<IApartment> = {
				number: String(formData.number),
				floor: Number(formData.floor),
				area: String(formData.area),
				room_count: Number(formData.room_count),
				final_price: String(formData.final_price),
				building_id: apartment.building_id,
				bct_ids: apartment.bct_ids || [],
			};
			await updateMutation.mutateAsync({
				id: Number(apartment.id),
				data: payload,
			});

			setOpen(false);
		} catch (err: unknown) {
			let message = t("update_error");

			if (err instanceof Error) {
				try {
					const parsed = JSON.parse(err.message) as ApiError;
					message = parsed.detail || parsed.message || message;
				} catch {
					message = err.message;
				}
			}
			toast.error(message);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<button className="px-3 py-1 flex gap-1.5 items-center bg-gradient-to-r from-indigo-50/20 to-white border border-indigo-200 rounded-sm text-sm font-medium text-indigo-700">
					<MdEdit size={16} />
					{tc("edit")}
				</button>
			</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{t("edit_title", { number: apartment.number })}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 pt-4">
					<div className="grid grid-cols-2 gap-4">
						<label className="font-light text-sm">
							{t("number_field")}
							<input
								name="number"
								value={formData.number}
								onChange={handleChange}
								placeholder={t("number_field")}
								className="border p-2 rounded text-sm"
								required
							/>
						</label>

						<label className="font-light text-sm">
							{t("floor_field")}
							<input
								type="number"
								name="floor"
								value={formData.floor}
								onChange={handleChange}
								placeholder={t("floor_field")}
								className="border p-2 rounded text-sm"
								required
							/>
						</label>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<label className="font-light text-sm">
							{t("area_field")}
							<input
								type="number"
								step="0.01"
								name="area"
								value={formData.area}
								onChange={handleChange}
								placeholder={t("area_field")}
								className="border p-2 rounded text-sm"
								required
							/>
						</label>
						<label className="font-light text-sm">
							{t("rooms_field")}
							<input
								type="number"
								name="room_count"
								value={formData.room_count}
								onChange={handleChange}
								placeholder={t("rooms_field")}
								className="border p-2 rounded text-sm"
								required
							/>
						</label>

						<label className="font-light text-sm">
							{t("price_field")}
							<input
								type="number"
								name="final_price"
								value={formData.final_price}
								onChange={handleChange}
								placeholder={t("price_placeholder")}
								className="border p-2 rounded text-sm"
								required
							/>
						</label>
					</div>
					<StatusUpdateCell apartment={apartment} />

					<div className="flex justify-end gap-2 pt-4">
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
						>
							{tc("cancel")}
						</button>

						<button
							type="submit"
							disabled={updateMutation.isPending}
							className="px-4 py-2 text-sm bg-indigo-900 text-white rounded disabled:bg-gray-400"
						>
							{updateMutation.isPending ? tc("saving") : tc("save")}
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
