"use client";

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
import { FormSection } from "@/components/shared/kit/form-section";
import { Segmented } from "@/components/shared/kit/segmented";
import { APARTMENT_STATUSES, statusStyle } from "@/lib/apartment-status";
import { cn } from "@/lib/cn";
import { Check, Loader2, Plus } from "lucide-react";
import { FC, useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useBuildings } from "@/action/hooks/buildings-hook/get-buildings";
import { useCreateApartment } from "@/action/hooks/apartments-hook/create-apartment.hook";
import { getCoefficientTypesByBuildingId } from "@/action/coefficient-types/get-coefficient-type.api";
import { useLayoutsByBuilding } from "@/action/hooks/layouts-hook/get-layouts.hook";
import { createLayout } from "@/action/layouts/create-layout.api";
import type { ICoefficientTypeGroup } from "@/types/coefficient-type.types";
import type { TModalPropsAddedApartments } from "@/types/props.types";
import type { ILayout } from "@/types/layout.types";
import { TApartmentStatus } from "@/types/apartment.types";

const NONE = "none";

export const ModalAddedApartments: FC<TModalPropsAddedApartments> = ({
	onSuccess,
	defaultBuildingId,
}) => {
	const { data: buildings = [] } = useBuildings();
	const createMutation = useCreateApartment();
	const t = useTranslations("apartment");
	const ts = useTranslations("status");
	const tc = useTranslations("common");
	const tco = useTranslations("coefficient");

	const [open, setOpen] = useState(false);
	const [selectedLayoutId, setSelectedLayoutId] = useState<number | null>(null);

	const [formData, setFormData] = useState({
		number: "",
		floor: "",
		room_count: "",
		building_id: defaultBuildingId ? String(defaultBuildingId) : "",
		area: "",
		status: "free" as TApartmentStatus,
		bct_ids: [] as number[],
	});

	const { data: layouts = [] } = useLayoutsByBuilding(formData.building_id || null);

	const [selectedBuildingFloorCount, setSelectedBuildingFloorCount] = useState<
		number | null
	>(null);
	const [coefficientGroups, setCoefficientGroups] = useState<
		ICoefficientTypeGroup[]
	>([]);
	const [isLoadingCoefficientGroups, setIsLoadingCoefficientGroups] =
		useState(false);

	useEffect(() => {
		if (!formData.building_id) {
			setSelectedBuildingFloorCount(null);
			setCoefficientGroups([]);
			setSelectedLayoutId(null);
			return;
		}

		const buildingIdNum = Number(formData.building_id);
		const building = buildings.find((b) => b.id === buildingIdNum);

		if (building) {
			const floorCount =
				typeof building.floor_count === "string"
					? Number(building.floor_count)
					: building.floor_count;
			setSelectedBuildingFloorCount(floorCount);
		}

		const fetchCoefficients = async () => {
			setIsLoadingCoefficientGroups(true);
			try {
				const data = await getCoefficientTypesByBuildingId(buildingIdNum);
				setCoefficientGroups(data || []);
			} catch (err) {
				console.error("coefficient fetch error:", err);
			} finally {
				setIsLoadingCoefficientGroups(false);
			}
		};

		fetchCoefficients();
	}, [formData.building_id, buildings]);

	const handleSelectLayout = (layout: ILayout) => {
		setSelectedLayoutId(layout.id);
		setFormData((prev) => ({
			...prev,
			room_count: String(layout.room_count),
			area: String(layout.area),
		}));
	};

	const handleDeselectLayout = () => {
		setSelectedLayoutId(null);
	};

	const setBuilding = (value: string) => {
		setFormData((prev) => ({
			...prev,
			building_id: value,
			floor: "",
			bct_ids: [],
			room_count: "",
			area: "",
		}));
		setSelectedLayoutId(null);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		if (name === "room_count" || name === "area") {
			setSelectedLayoutId(null);
		}

		if (name === "floor") {
			if (value === "" || /^\d+$/.test(value)) {
				const floorValue = Number(value);
				if (
					selectedBuildingFloorCount !== null &&
					floorValue > selectedBuildingFloorCount
				) {
					toast.error(t("max_floor_error", { max: selectedBuildingFloorCount }));
					return;
				}
				setFormData((prev) => ({ ...prev, floor: value }));
			}
			return;
		}

		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!formData.number.trim()) return toast.error(t("enter_number"));
		if (!formData.building_id) return toast.error(t("select_building_error"));

		const buildingId = Number(formData.building_id);
		const roomCount = Number(formData.room_count) || 0;
		const area = formData.area || "0";

		if (!selectedLayoutId && roomCount > 0 && Number(area) > 0) {
			const existing = layouts.find(
				(l) => l.room_count === roomCount && String(l.area) === area,
			);
			if (!existing) {
				await createLayout({
					building_id: buildingId,
					room_count: roomCount,
					area,
				});
			}
		}

		const apartmentData = {
			number: formData.number,
			building_id: buildingId,
			floor: Number(formData.floor) || 0,
			room_count: roomCount,
			area,
			status: formData.status,
			bct_ids: formData.bct_ids,
		};

		try {
			await createMutation.mutateAsync({
				payload: apartmentData,
			});
			toast.success(t("added_success"));
			setOpen(false);

			setFormData({
				number: "",
				floor: "",
				room_count: "",
				building_id: defaultBuildingId ? String(defaultBuildingId) : "",
				area: "",
				status: "free",
				bct_ids: [],
			});
			setSelectedLayoutId(null);

			onSuccess?.();
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : t("add_error");
			toast.error(errorMessage);
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

			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{t("add_title")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<FormSection title={t("section_main")}>
						{!defaultBuildingId && (
							<Field label={t("building_label")} required className="sm:col-span-2">
								<Select
									value={formData.building_id}
									onValueChange={(v) => setBuilding(v)}
								>
									<SelectTrigger>
										<SelectValue placeholder={t("select_building")} />
									</SelectTrigger>
									<SelectContent>
										{buildings.map((b) => (
											<SelectItem key={b.id} value={String(b.id)}>
												{b.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						)}

						<Field label={t("number_label")} htmlFor="apt-number" required>
							<Input
								id="apt-number"
								name="number"
								value={formData.number}
								onChange={handleChange}
								required
								autoFocus
							/>
						</Field>

						<Field label={t("floor_label")} htmlFor="apt-floor">
							<Input
								id="apt-floor"
								name="floor"
								type="number"
								value={formData.floor}
								onChange={handleChange}
								placeholder={
									selectedBuildingFloorCount
										? t("max_floor_placeholder", { max: selectedBuildingFloorCount })
										: t("select_building")
								}
								disabled={!formData.building_id}
							/>
						</Field>

						<Field label={t("status_label")} className="sm:col-span-2">
							<Segmented
								className="w-full sm:w-auto"
								value={formData.status}
								onChange={(v) => setFormData((prev) => ({ ...prev, status: v }))}
								options={APARTMENT_STATUSES.map((s) => ({
									value: s,
									label: (
										<span className="flex items-center gap-1.5">
											<span className={cn("size-2 rounded-full", statusStyle(s).dot)} />
											{ts(s)}
										</span>
									),
								}))}
							/>
						</Field>
					</FormSection>

					<FormSection title={t("layout_label")} hint={formData.building_id ? t("layout_hint") : undefined}>
						{formData.building_id && (
							<div className="flex flex-wrap gap-1.5 sm:col-span-2">
								{layouts.length === 0 ? (
									<span className="text-xs text-slate-400">{t("layout_empty")}</span>
								) : (
									layouts.map((layout) => {
										const isActive = selectedLayoutId === layout.id;
										return (
											<button
												key={layout.id}
												type="button"
												onClick={() =>
													isActive ? handleDeselectLayout() : handleSelectLayout(layout)
												}
												className={cn(
													"inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
													isActive
														? "border-primary bg-primary text-white"
														: "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-ink",
												)}
											>
												{isActive && <Check size={13} />}
												{layout.name || `${layout.room_count}-комн. ${layout.area}м²`}
											</button>
										);
									})
								)}
							</div>
						)}

						<Field label={t("rooms_label")} htmlFor="apt-rooms" required>
							<Input
								id="apt-rooms"
								name="room_count"
								type="number"
								value={formData.room_count}
								onChange={handleChange}
								required
								placeholder={t("select_layout_hint")}
							/>
						</Field>

						<Field label={t("area_label")} htmlFor="apt-area" required>
							<Input
								id="apt-area"
								name="area"
								inputMode="decimal"
								value={formData.area}
								onChange={handleChange}
								required
								placeholder={t("select_layout_hint")}
							/>
						</Field>
					</FormSection>

					{coefficientGroups.length > 0 && (
						<FormSection title={tco("section_title")}>
							{coefficientGroups.map((group) => {
								const current = formData.bct_ids.find((id) =>
									group.bcts.some((b) => b.id === id),
								);
								return (
									<Field key={group.id} label={group.name}>
										<Select
											value={current ? String(current) : NONE}
											disabled={isLoadingCoefficientGroups}
											onValueChange={(v) => {
												const value = v === NONE ? 0 : Number(v);
												setFormData((prev) => {
													const filtered = prev.bct_ids.filter(
														(id) => !group.bcts.some((b) => b.id === id),
													);
													return {
														...prev,
														bct_ids: value ? [...filtered, value] : filtered,
													};
												});
											}}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={NONE}>{t("coef_not_selected")}</SelectItem>
												{group.bcts.map((bct) => (
													<SelectItem key={bct.id} value={String(bct.id)}>
														{bct.name} · {bct.rate}%
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</Field>
								);
							})}
						</FormSection>
					)}

					<DialogFooter className="border-t border-slate-200/70 pt-4">
						<Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={pending}>
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
