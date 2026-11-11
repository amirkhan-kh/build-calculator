"use client";

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { useUpdateBuilding } from "@/action/hooks/buildings-hook/update-building";
import type { ModalUpdateBuildingsProps } from "@/types/props.types";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil } from "lucide-react";
import { Field } from "@/components/shared/kit/field";
import { useTranslations } from "next-intl";

export function ModalUpdateBuildings({
	building,
	onSuccess,
}: ModalUpdateBuildingsProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(building.name || "");
	const [floorCount, setFloorCount] = useState(
		Number(building.floor_count) || 0,
	);
	const [maxCoefficient, setMaxCoefficient] = useState<number | "">(
		Number(building.max_coefficient) || "",
	);
	const [basePrice, setBasePrice] = useState(Number(building.base_price) || 0);

	const updateMutation = useUpdateBuilding();
	const t = useTranslations("building");
	const tc = useTranslations("common");

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		try {
			await updateMutation.mutateAsync({
				id: building.id,
				data: {
					name,
					floor_count: floorCount,
					max_coefficient:
						maxCoefficient === "" ? undefined : Number(maxCoefficient),
					base_price: Number(basePrice),
					complex_id: building.complex_id,
					price_unit: building.price_unit,
				},
			});

			setOpen(false);
			onSuccess?.();
		} catch (error) {
			console.error("Update process failed:", error);
		}
	};

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (next) {
			setName(building.name || "");
			setFloorCount(Number(building.floor_count) || 0);
			setMaxCoefficient(Number(building.max_coefficient) || "");
			setBasePrice(Number(building.base_price) || 0);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Pencil />
					{tc("change")}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{t("update_title")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
					<Field label={t("name_field")} htmlFor="b-name" className="col-span-2">
						<Input id="b-name" value={name} onChange={(e) => setName(e.target.value)} />
					</Field>

					<Field label={t("floors_field")} htmlFor="b-floors">
						<Input
							id="b-floors"
							type="number"
							value={floorCount}
							onChange={(e) => setFloorCount(Number(e.target.value))}
						/>
					</Field>
					<Field label={t("max_coef_field")} htmlFor="b-coef">
						<Input
							id="b-coef"
							type="number"
							value={maxCoefficient}
							step={0.01}
							onChange={(e) =>
								setMaxCoefficient(e.target.value === "" ? "" : Number(e.target.value))
							}
						/>
					</Field>

					<Field label={`${t("base_price_field")}, ${building.price_unit}`} htmlFor="b-price" className="col-span-2">
						<Input
							id="b-price"
							type="number"
							value={basePrice}
							step={0.01}
							onChange={(e) => setBasePrice(Number(e.target.value))}
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
