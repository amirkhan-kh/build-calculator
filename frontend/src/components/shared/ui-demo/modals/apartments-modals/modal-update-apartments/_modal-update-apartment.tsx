"use client";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/kit/field";
import { useTranslations } from "next-intl";
import { useUpdateApartment } from "@/action/hooks/apartments-hook/update-apartment.hook";
import type { ApartmentFormData, IApartment } from "@/types/apartment.types";
import type { PropsModalUpdateApartments } from "@/types/props.types";

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
				<Button variant="outline" size="sm">
					<Pencil />
					{tc("edit")}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{t("edit_title", { number: apartment.number })}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
					<Field label={t("number_field")} htmlFor="ua-number" required>
						<Input id="ua-number" name="number" value={formData.number} onChange={handleChange} required />
					</Field>
					<Field label={t("floor_field")} htmlFor="ua-floor" required>
						<Input id="ua-floor" type="number" name="floor" value={formData.floor} onChange={handleChange} required />
					</Field>
					<Field label={t("area_field")} htmlFor="ua-area" required>
						<Input id="ua-area" type="number" step="0.01" name="area" value={formData.area} onChange={handleChange} required />
					</Field>
					<Field label={t("rooms_field")} htmlFor="ua-rooms" required>
						<Input id="ua-rooms" type="number" name="room_count" value={formData.room_count} onChange={handleChange} required />
					</Field>
					<Field label={t("price_field")} htmlFor="ua-price" required className="col-span-2">
						<Input
							id="ua-price"
							type="number"
							name="final_price"
							value={formData.final_price}
							onChange={handleChange}
							placeholder={t("price_placeholder")}
							required
						/>
					</Field>

					<DialogFooter className="col-span-2 pt-2">
						<Button type="button" variant="outline" onClick={() => setOpen(false)}>
							{tc("cancel")}
						</Button>
						<Button type="submit" disabled={updateMutation.isPending}>
							{updateMutation.isPending && <Loader2 className="animate-spin" />}
							{updateMutation.isPending ? tc("saving") : tc("save")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
