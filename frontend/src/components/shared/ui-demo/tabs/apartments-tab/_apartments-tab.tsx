"use client";

import { useCallback, useMemo, useState } from "react";
import { ImFileEmpty } from "react-icons/im";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useApartments } from "@/action/hooks/apartments-hook/get-apartments.hook";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/query-keys";
import { ApartmentCard } from "@/components/shared/ui-demo/cards/_apartment-card";
import { ModalAddedApartments } from "@/components/shared/ui-demo/modals/apartments-modals/modal-add-apartments/_modal-add-apartments";
import ModaDataSendingForExel from "@/components/shared/ui-demo/modals/building-modals/modal-sending-for-exel/_modal-sending-for-exel";
import { SpinnerDemo } from "@/components/shared/ui-demo/spinner-demo/_spinner-demo";
import type { IApartment, TApartmentStatus } from "@/types/apartment.types";

interface ApartmentsTabProps {
	buildingId: number;
}

const inputClass = "w-full rounded-xl border border-transparent bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-200 focus:bg-white transition-all";

export function ApartmentsTab({ buildingId }: ApartmentsTabProps) {
	const queryClient = useQueryClient();
	const t = useTranslations("filter");
	const ta = useTranslations("apartment");
	const ts = useTranslations("status");
	const tsort = useTranslations("sort");
	const tc = useTranslations("common");

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

	const [filtersOpen, setFiltersOpen] = useState(true);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [sortBy, setSortBy]             = useState("default");
	const [search, setSearch]             = useState("");
	const [roomMin, setRoomMin]           = useState("");
	const [roomMax, setRoomMax]           = useState("");
	const [floorMin, setFloorMin]         = useState("");
	const [floorMax, setFloorMax]         = useState("");
	const [areaMin, setAreaMin]           = useState("");
	const [areaMax, setAreaMax]           = useState("");

	const params = useMemo(
		() => ({
			building_id: buildingId,
			...(statusFilter !== "all" ? { status: statusFilter } : {}),
			limit: 50,
		}),
		[buildingId, statusFilter],
	);

	const { data, isLoading, refetch } = useApartments(params);

	const apartments = useMemo(
		() => (Array.isArray(data) ? (data as IApartment[]) : []),
		[data],
	);

	const filtered = useMemo(() => {
		let result = [...apartments];

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
	}, [apartments, search, roomMin, roomMax, floorMin, floorMax, areaMin, areaMax, sortBy]);

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
		<div className="mt-2">
			<div className="flex items-center justify-between mb-4">
				<p className="text-xs text-gray-400">
					{ta("count_in_building", { count: apartments.length })}
				</p>
				<div className="flex items-center gap-2">
					<ModaDataSendingForExel
						buildingId={buildingId}
						triggerLabel="Excel"
					/>
					<ModalAddedApartments defaultBuildingId={buildingId} onSuccess={handleRefresh} />
				</div>
			</div>

			{!isLoading && (
				<div className="mb-5 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
					<button
						type="button"
						onClick={() => setFiltersOpen((v) => !v)}
						className="flex w-full items-center justify-between px-5 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
					>
						<div className="flex items-center gap-2">
							<SlidersHorizontal size={14} className="text-gray-400" />
							<span className="text-sm font-bold text-gray-700">{t("title")}</span>
							{activeCount > 0 && (
								<span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[10px] font-bold text-white">
									{activeCount}
								</span>
							)}
						</div>
						<div className="flex items-center gap-3">
							{activeCount > 0 && (
								<span
									onClick={(e) => { e.stopPropagation(); handleReset(); }}
									className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
								>
									<X size={12} />
									{t("reset")}
								</span>
							)}
							<ChevronDown
								size={15}
								className={`text-gray-400 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
							/>
						</div>
					</button>

					{filtersOpen && (
						<div className="p-5 flex flex-col gap-5">
							<div className="relative">
								<Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
								<input
									type="text"
									placeholder={t("search_apartments")}
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="w-full rounded-xl border border-transparent bg-gray-50 py-3 pl-10 pr-10 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-200 focus:bg-white transition-all"
								/>
								{search && (
									<button
										onClick={() => setSearch("")}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
									>
										<X size={14} />
									</button>
								)}
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
										{t("status_label")}
									</p>
									<div className="flex flex-wrap gap-1.5">
										{STATUS_OPTIONS.map((o) => (
											<button
												key={o.value}
												type="button"
												onClick={() => setStatusFilter(o.value)}
												className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
													statusFilter === o.value
														? "bg-indigo-500 text-white shadow-sm shadow-indigo-200"
														: "bg-gray-50 text-gray-600 hover:bg-gray-100"
												}`}
											>
												{o.label}
											</button>
										))}
									</div>
								</div>

								<div>
									<p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
										{t("rooms_label")}
									</p>
									<div className="flex items-center gap-2">
										<input type="number" placeholder={tc("from")} value={roomMin} onChange={(e) => setRoomMin(e.target.value)} className={inputClass} />
										<span className="text-gray-300 font-medium">—</span>
										<input type="number" placeholder={tc("to")} value={roomMax} onChange={(e) => setRoomMax(e.target.value)} className={inputClass} />
									</div>
								</div>
							</div>

							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
									{t("sort_label")}
								</p>
								<div className="flex flex-wrap gap-1.5">
									{SORT_OPTIONS.map((o) => (
										<button
											key={o.value}
											type="button"
											onClick={() => setSortBy(o.value)}
											className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
												sortBy === o.value
													? "bg-indigo-500 text-white shadow-sm shadow-indigo-200"
													: "bg-gray-50 text-gray-600 hover:bg-gray-100"
											}`}
										>
											{o.label}
										</button>
									))}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
										{t("floor_label")}
									</p>
									<div className="flex items-center gap-2">
										<input type="number" placeholder={tc("from")} value={floorMin} onChange={(e) => setFloorMin(e.target.value)} className={inputClass} />
										<span className="text-gray-300 font-medium">—</span>
										<input type="number" placeholder={tc("to")} value={floorMax} onChange={(e) => setFloorMax(e.target.value)} className={inputClass} />
									</div>
								</div>
								<div>
									<p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
										{t("area_label")}
									</p>
									<div className="flex items-center gap-2">
										<input type="number" placeholder={tc("from")} value={areaMin} onChange={(e) => setAreaMin(e.target.value)} className={inputClass} />
										<span className="text-gray-300 font-medium">—</span>
										<input type="number" placeholder={tc("to")} value={areaMax} onChange={(e) => setAreaMax(e.target.value)} className={inputClass} />
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{isLoading ? (
				<div className="flex justify-center py-12">
					<SpinnerDemo />
				</div>
			) : apartments.length === 0 ? (
				<div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
					<ImFileEmpty size={36} className="mx-auto text-gray-300 mb-3" />
					<p className="text-gray-500 text-sm font-medium">
						{ta("empty")}
					</p>
				</div>
			) : filtered.length === 0 ? (
				<div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
					<ImFileEmpty size={36} className="mx-auto text-gray-300 mb-3" />
					<p className="text-gray-500 text-sm font-medium">{ta("nothing_found")}</p>
					<button
						onClick={handleReset}
						className="mt-2 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
					>
						{t("reset")}
					</button>
				</div>
			) : (
				<>
					<p className="text-xs text-gray-400 mb-3">
						{ta("showing", { shown: filtered.length, total: apartments.length })}
					</p>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
