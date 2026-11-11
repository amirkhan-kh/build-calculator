"use client";

import { useCallback, useMemo, useState } from "react";
import { DoorOpen, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBuildingApartments } from "@/action/hooks/apartments-hook/get-apartments.hook";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/query-keys";
import { ApartmentCard } from "@/components/shared/ui-demo/cards/_apartment-card";
import { ModalAddedApartments } from "@/components/shared/ui-demo/modals/apartments-modals/modal-add-apartments/_modal-add-apartments";
import ModaDataSendingForExel from "@/components/shared/ui-demo/modals/building-modals/modal-sending-for-exel/_modal-sending-for-exel";
import type { TApartmentStatus } from "@/types/apartment.types";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/shared/kit/empty-state";
import { SearchInput } from "@/components/shared/kit/search-input";
import { FilterBar, InlineRange, ResetFiltersButton, SortSelect } from "@/components/shared/kit/filter-bar";
import { statusStyle } from "@/lib/apartment-status";
import { cn } from "@/lib/cn";

interface ApartmentsTabProps {
	buildingId: number;
}

export function ApartmentsTab({ buildingId }: ApartmentsTabProps) {
	const queryClient = useQueryClient();
	const t = useTranslations("filter");
	const ta = useTranslations("apartment");
	const ts = useTranslations("status");
	const tsort = useTranslations("sort");

	const STATUS_OPTIONS: { value: TApartmentStatus | "all"; label: string }[] = [
		{ value: "all",       label: ts("all") },
		{ value: "free",      label: ts("free") },
		{ value: "sold",      label: ts("sold") },
		{ value: "booked",    label: ts("booked") },
		{ value: "withdrawn", label: ts("withdrawn") },
	];

	const SORT_OPTIONS = [
		{ value: "default",    label: tsort("default") },
		{ value: "number_asc", label: tsort("number_asc") },
		{ value: "number_desc",label: tsort("number_desc") },
		{ value: "floor_asc",  label: tsort("floor_asc") },
		{ value: "floor_desc", label: tsort("floor_desc") },
		{ value: "area_asc",   label: tsort("area_asc") },
		{ value: "area_desc",  label: tsort("area_desc") },
		{ value: "price_asc",  label: tsort("price_asc") },
		{ value: "price_desc", label: tsort("price_desc") },
	];

	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [sortBy, setSortBy]             = useState("default");
	const [search, setSearch]             = useState("");
	const [roomMin, setRoomMin]           = useState("");
	const [roomMax, setRoomMax]           = useState("");
	const [floorMin, setFloorMin]         = useState("");
	const [floorMax, setFloorMax]         = useState("");
	const [areaMin, setAreaMin]           = useState("");
	const [areaMax, setAreaMax]           = useState("");

	const { data, isLoading, refetch } = useBuildingApartments(buildingId);

	const apartments = useMemo(() => data ?? [], [data]);

	const statusCounts = useMemo(() => {
		const counts: Record<string, number> = { all: apartments.length };
		for (const a of apartments) counts[a.status] = (counts[a.status] ?? 0) + 1;
		return counts;
	}, [apartments]);

	const filtered = useMemo(() => {
		let result = [...apartments];

		if (statusFilter !== "all") result = result.filter((a) => a.status === statusFilter);

		if (search.trim()) {
			result = result.filter((a) =>
				a.number.toLowerCase().includes(search.toLowerCase()),
			);
		}

		if (roomMin) result = result.filter((a) => a.room_count >= Number(roomMin));
		if (roomMax) result = result.filter((a) => a.room_count <= Number(roomMax));

		if (floorMin) result = result.filter((a) => a.floor >= Number(floorMin));
		if (floorMax) result = result.filter((a) => a.floor <= Number(floorMax));
		if (areaMin)  result = result.filter((a) => Number(a.area) >= Number(areaMin));
		if (areaMax)  result = result.filter((a) => Number(a.area) <= Number(areaMax));

		switch (sortBy) {
			case "number_asc":  result.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })); break;
			case "number_desc": result.sort((a, b) => b.number.localeCompare(a.number, undefined, { numeric: true })); break;
			case "floor_asc":   result.sort((a, b) => a.floor - b.floor); break;
			case "floor_desc":  result.sort((a, b) => b.floor - a.floor); break;
			case "area_asc":    result.sort((a, b) => Number(a.area) - Number(b.area)); break;
			case "area_desc":   result.sort((a, b) => Number(b.area) - Number(a.area)); break;
			case "price_asc":   result.sort((a, b) => Number(a.final_price) - Number(b.final_price)); break;
			case "price_desc":  result.sort((a, b) => Number(b.final_price) - Number(a.final_price)); break;
		}

		return result;
	}, [apartments, statusFilter, search, roomMin, roomMax, floorMin, floorMax, areaMin, areaMax, sortBy]);

	const handleRefresh = useCallback(async () => {
		await refetch();
		await queryClient.invalidateQueries({ queryKey: QueryKeys.apartments.all });
	}, [refetch, queryClient]);

	const handleReset = () => {
		setStatusFilter("all");
		setSortBy("default");
		setSearch("");
		setRoomMin(""); setRoomMax("");
		setFloorMin(""); setFloorMax("");
		setAreaMin("");  setAreaMax("");
	};

	const activeCount = [
		statusFilter !== "all",
		sortBy !== "default",
		search,
		roomMin, roomMax,
		floorMin, floorMax,
		areaMin, areaMax,
	].filter(Boolean).length;

	return (
		<div>
			<div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
				<div role="radiogroup" className="flex flex-wrap items-center gap-1.5">
					{STATUS_OPTIONS.map((o) => {
						const active = statusFilter === o.value;
						return (
							<button
								key={o.value}
								type="button"
								role="radio"
								aria-checked={active}
								onClick={() => setStatusFilter(o.value)}
								className={cn(
									"inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[13px] font-medium transition-colors",
									active
										? "border-primary bg-primary text-white shadow-sm"
										: "border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 hover:text-slate-900",
								)}
							>
								{o.value !== "all" && (
									<span className={cn("size-2 rounded-full", statusStyle(o.value).dot)} />
								)}
								{o.label}
								<span className={cn("tabular-nums", active ? "text-white/70" : "text-slate-400")}>
									{statusCounts[o.value] ?? 0}
								</span>
							</button>
						);
					})}
				</div>
				<div className="flex shrink-0 items-center gap-2">
					<ModaDataSendingForExel buildingId={buildingId} triggerLabel="Excel" />
					<ModalAddedApartments defaultBuildingId={buildingId} onSuccess={handleRefresh} />
				</div>
			</div>

			{!isLoading && apartments.length > 0 && (
				<FilterBar>
					<SearchInput
						className="w-full sm:w-56"
						value={search}
						onChange={setSearch}
						placeholder={t("search_apartments")}
					/>
					<SortSelect value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
					<InlineRange label={t("rooms_label")} min={roomMin} max={roomMax} onMinChange={setRoomMin} onMaxChange={setRoomMax} inputClassName="w-[60px]" />
					<InlineRange label={t("floor_label")} min={floorMin} max={floorMax} onMinChange={setFloorMin} onMaxChange={setFloorMax} inputClassName="w-[60px]" />
					<InlineRange label={t("area_label")} min={areaMin} max={areaMax} onMinChange={setAreaMin} onMaxChange={setAreaMax} inputClassName="w-[72px]" />
					{activeCount > 0 && <ResetFiltersButton onClick={handleReset} />}
				</FilterBar>
			)}

			{isLoading ? (
				<LoadingState className="min-h-48" />
			) : apartments.length === 0 ? (
				<EmptyState icon={DoorOpen} title={ta("empty")} />
			) : filtered.length === 0 ? (
				<EmptyState
					icon={SearchX}
					title={ta("nothing_found")}
					action={
						<Button variant="outline" size="sm" onClick={handleReset}>
							{t("reset")}
						</Button>
					}
				/>
			) : (
				<>
					<p className="mb-3 text-xs text-slate-500">
						{ta("showing", { shown: filtered.length, total: apartments.length })}
					</p>
					<div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
						{filtered.map((apartment) => (
							<ApartmentCard
								key={apartment.id}
								apartment={apartment}
								onSuccess={handleRefresh}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}
