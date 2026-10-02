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

export const ModalAddedApartments: FC<TModalPropsAddedApartments> = ({
	onSuccess,
	defaultBuildingId,
}) => {
	const { data: buildings = [] } = useBuildings();
	const createMutation = useCreateApartment();
	const t = useTranslations("apartment");
	const ts = useTranslations("status");
	const tc = useTranslations("common");

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

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
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

		if (name === "building_id") {
			setFormData((prev) => ({
				...prev,
				building_id: value,
				floor: "",
				bct_ids: [],
				room_count: "",
				area: "",
			}));
			setSelectedLayoutId(null);
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

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button className="bg-[#282964] px-3 py-1 rounded-[3px] text-white text-sm hover:bg-[#1f2050] transition-colors">
					{t("add_btn")}
				</button>
			</DialogTrigger>

			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("add_title")}</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className="py-4 grid grid-cols-1 md:grid-cols-2 gap-5"
				>
					{!defaultBuildingId && (
						<div className="space-y-2">
							<label className="text-sm font-medium">{t("building_label")}</label>
							<select
								name="building_id"
								value={formData.building_id}
								onChange={handleChange}
								required
								className="w-full h-10 border rounded px-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
							>
								<option value="">{t("select_building")}</option>
								{buildings.map((b) => (
									<option key={b.id} value={b.id}>
										{b.name}
									</option>
								))}
							</select>
						</div>
					)}

					<div className="space-y-2">
						<label className="text-sm font-medium">{t("status_label")}</label>
						<select
							name="status"
							value={formData.status}
							onChange={handleChange}
							required
							className="w-full h-10 border rounded px-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
						>
							<option value="free">{ts("free")}</option>
							<option value="sold">{ts("sold")}</option>
							<option value="booked">{ts("booked")}</option>
							<option value="withdrawn">{ts("withdrawn")}</option>
						</select>
					</div>

					{formData.building_id && (
						<div className="col-span-1 md:col-span-2 space-y-2">
							<label className="text-sm font-medium text-gray-700">
								{t("layout_label")}{" "}
								<span className="text-xs font-normal text-gray-400">
									{t("layout_hint")}
								</span>
							</label>
							<div className="flex flex-wrap gap-2 min-h-[36px]">
								{layouts.length === 0 ? (
									<span className="text-xs text-gray-400 italic self-center">
										{t("layout_empty")}
									</span>
								) : (
									layouts.map((layout) => {
										const isActive = selectedLayoutId === layout.id;
										return (
											<button
												key={layout.id}
												type="button"
												onClick={() =>
													isActive
														? handleDeselectLayout()
														: handleSelectLayout(layout)
												}
												className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
													isActive
														? "bg-indigo-900 text-white border-indigo-900"
														: "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-700"
												}`}
											>
												{layout.name ||
													`${layout.room_count}-комн. ${layout.area}м²`}
											</button>
										);
									})
								)}
							</div>
						</div>
					)}

					<div className="space-y-2">
						<label className="text-sm font-medium">{t("number_label")}</label>
						<Input
							name="number"
							value={formData.number}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">{t("floor_label")}</label>
						<Input
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
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">{t("rooms_label")}</label>
						<Input
							name="room_count"
							type="number"
							value={formData.room_count}
							onChange={handleChange}
							required
							placeholder={t("select_layout_hint")}
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">{t("area_label")}</label>
						<Input
							name="area"
							value={formData.area}
							onChange={handleChange}
							required
							placeholder={t("select_layout_hint")}
						/>
					</div>

					<div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
						{coefficientGroups.map((group) => (
							<div key={group.id} className="space-y-2">
								<label className="text-sm font-medium">{t("coef_type_label")}: {group.name}</label>
								<select
									value={
										formData.bct_ids.find((id) =>
											group.bcts.some((b) => b.id === id),
										) ?? ""
									}
									onChange={(e) => {
										const value = Number(e.target.value);
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
									className="w-full h-10 border rounded px-3 bg-white disabled:opacity-50"
									disabled={isLoadingCoefficientGroups}
								>
									<option value="">{t("coef_not_selected")}</option>
									{group.bcts.map((bct) => (
										<option key={bct.id} value={bct.id}>
											{bct.name} ({bct.rate})
										</option>
									))}
								</select>
							</div>
						))}
					</div>

					<DialogFooter className="col-span-1 md:col-span-2 flex gap-3">
						<Button
							variant="outline"
							type="button"
							onClick={() => setOpen(false)}
						>
							{tc("cancel")}
						</Button>
						<Button
							type="submit"
							className="bg-[#282964] text-white hover:bg-[#1f2050]"
							disabled={createMutation.isPending}
						>
							{createMutation.isPending ? tc("adding") : tc("add")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
