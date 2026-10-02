"use client";

import { useCallback, useMemo, useState } from "react";
import { ImFileEmpty } from "react-icons/im";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBuildingsByComplex } from "@/action/hooks/buildings-hook/buildings-by-complex";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/query-keys";
import { ModalAddedBuilding } from "../modals/building-modals/modal-add-building/_modal-add-building";
import { BuildingCard } from "../cards/_building-card";
import { SpinnerDemo } from "../spinner-demo/_spinner-demo";
import type { IBuildings } from "@/types/building.types";

interface Props {
	complexId: number;
	complexName?: string;
}

export default function ComplexBuildingsSection({ complexId, complexName }: Props) {
	const queryClient = useQueryClient();
	const { data, isLoading, refetch } = useBuildingsByComplex(complexId);
	const t = useTranslations("building");
	const tf = useTranslations("filter");
	const tc = useTranslations("common");
	const ta = useTranslations("apartment");

	const SORT_OPTIONS = [
		{ value: "default",    label: t("sort_default") },
		{ value: "price_asc",  label: t("sort_price_asc") },
		{ value: "price_desc", label: t("sort_price_desc") },
		{ value: "floor_asc",  label: t("sort_floor_asc") },
		{ value: "floor_desc", label: t("sort_floor_desc") },
		{ value: "coef_asc",   label: t("sort_coef_asc") },
		{ value: "coef_desc",  label: t("sort_coef_desc") },
	];

	const buildings = Array.isArray(data) ? (data as IBuildings[]) : [];

	const [filtersOpen, setFiltersOpen] = useState(true);
	const [search, setSearch]       = useState("");
	const [sortBy, setSortBy]       = useState("default");
	const [priceMin, setPriceMin]   = useState("");
	const [priceMax, setPriceMax]   = useState("");
	const [floorsMin, setFloorsMin] = useState("");
	const [floorsMax, setFloorsMax] = useState("");

	const activeCount = [
		search,
		sortBy !== "default" ? sortBy : "",
		priceMin, priceMax,
		floorsMin, floorsMax,
	].filter(Boolean).length;

	const handleReset = () => {
		setSearch(""); setSortBy("default");
		setPriceMin(""); setPriceMax("");
		setFloorsMin(""); setFloorsMax("");
	};

	const filtered = useMemo(() => {
		let result = [...buildings];

		if (search.trim()) {
			const q = search.toLowerCase();
			result = result.filter((b) => b.name.toLowerCase().includes(q));
		}

		if (priceMin) result = result.filter((b) => Number(b.base_price) >= Number(priceMin));
		if (priceMax) result = result.filter((b) => Number(b.base_price) <= Number(priceMax));
		if (floorsMin) result = result.filter((b) => Number(b.floor_count) >= Number(floorsMin));
		if (floorsMax) result = result.filter((b) => Number(b.floor_count) <= Number(floorsMax));

		switch (sortBy) {
			case "price_asc":  result.sort((a, b) => Number(a.base_price) - Number(b.base_price)); break;
			case "price_desc": result.sort((a, b) => Number(b.base_price) - Number(a.base_price)); break;
			case "floor_asc":  result.sort((a, b) => Number(a.floor_count) - Number(b.floor_count)); break;
			case "floor_desc": result.sort((a, b) => Number(b.floor_count) - Number(a.floor_count)); break;
			case "coef_asc":   result.sort((a, b) => a.max_coefficient - b.max_coefficient); break;
			case "coef_desc":  result.sort((a, b) => b.max_coefficient - a.max_coefficient); break;
		}

		return result;
	}, [buildings, search, sortBy, priceMin, priceMax, floorsMin, floorsMax]);

	const handleRefresh = useCallback(async () => {
		await refetch();
		await queryClient.invalidateQueries({ queryKey: QueryKeys.buildings.all });
	}, [refetch, queryClient]);

	const inputClass = "w-full rounded-xl border border-transparent bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-200 focus:bg-white transition-all";

	return (
		<div className="mt-8">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-lg font-black text-gray-900">{t("buildings_title")}</h2>
					<p className="text-xs text-gray-400 mt-0.5">
						{t("buildings_count", { count: buildings.length })}
					</p>
				</div>
				<ModalAddedBuilding defaultComplexId={complexId} onSuccess={handleRefresh} />
			</div>

			{!isLoading && buildings.length > 0 && (
				<div className="mb-5 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
					<button
						onClick={() => setFiltersOpen((v) => !v)}
						className="flex w-full items-center justify-between px-5 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
					>
						<div className="flex items-center gap-2">
							<SlidersHorizontal size={14} className="text-gray-400" />
							<span className="text-sm font-bold text-gray-700">{tf("title")}</span>
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
									{tf("reset")}
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
								placeholder={tf("search_buildings")}
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="w-full rounded-xl border border-transparent bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-200 focus:bg-white transition-all"
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

						<div>
							<p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
								{tf("sort_label")}
							</p>
							<div className="flex flex-wrap gap-1.5">
								{SORT_OPTIONS.map((o) => (
									<button
										key={o.value}
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
									{t("price_m2_stat")}
								</p>
								<div className="flex items-center gap-2">
									<input
										type="number"
										placeholder={tc("from")}
										value={priceMin}
										onChange={(e) => setPriceMin(e.target.value)}
										className={inputClass}
									/>
									<span className="text-gray-300 font-medium">—</span>
									<input
										type="number"
										placeholder={tc("to")}
										value={priceMax}
										onChange={(e) => setPriceMax(e.target.value)}
										className={inputClass}
									/>
								</div>
							</div>

							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
									{t("floors_stat")}
								</p>
								<div className="flex items-center gap-2">
									<input
										type="number"
										placeholder={tc("from")}
										value={floorsMin}
										onChange={(e) => setFloorsMin(e.target.value)}
										className={inputClass}
									/>
									<span className="text-gray-300 font-medium">—</span>
									<input
										type="number"
										placeholder={tc("to")}
										value={floorsMax}
										onChange={(e) => setFloorsMax(e.target.value)}
										className={inputClass}
									/>
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
			) : buildings.length === 0 ? (
				<div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
					<ImFileEmpty size={36} className="mx-auto text-gray-300 mb-3" />
					<p className="text-gray-500 text-sm font-medium">
						{t("no_buildings")}
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
						{ta("reset_filters")}
					</button>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filtered.map((building) => (
						<BuildingCard
							key={building.id}
							building={building}
							complexName={complexName}
							onSuccess={handleRefresh}
						/>
					))}
				</div>
			)}
		</div>
	);
}
