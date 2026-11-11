"use client";

import { useCallback, useMemo, useState } from "react";
import { Building, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useBuildingsByComplex } from "@/action/hooks/buildings-hook/buildings-by-complex";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/query-keys";
import { ModalAddedBuilding } from "../modals/building-modals/modal-add-building/_modal-add-building";
import { BuildingCard } from "../cards/_building-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/kit/page-header";
import { EmptyState, LoadingState } from "@/components/shared/kit/empty-state";
import { SearchInput } from "@/components/shared/kit/search-input";
import { FilterBar, InlineRange, ResetFiltersButton, SortSelect } from "@/components/shared/kit/filter-bar";
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

	return (
		<section className="mt-8">
			<PageHeader
				as="h2"
				className="mb-4"
				title={t("buildings_title")}
				description={t("buildings_count", { count: buildings.length })}
				actions={<ModalAddedBuilding defaultComplexId={complexId} onSuccess={handleRefresh} />}
			/>

			{!isLoading && buildings.length > 0 && (
				<FilterBar>
					<SearchInput
						className="w-full sm:w-64"
						value={search}
						onChange={setSearch}
						placeholder={tf("search_buildings")}
					/>
					<SortSelect value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
					<InlineRange
						label={t("price_m2_stat")}
						min={priceMin}
						max={priceMax}
						onMinChange={setPriceMin}
						onMaxChange={setPriceMax}
						inputClassName="w-[104px]"
					/>
					<InlineRange
						label={t("floors_stat")}
						min={floorsMin}
						max={floorsMax}
						onMinChange={setFloorsMin}
						onMaxChange={setFloorsMax}
						inputClassName="w-[68px]"
					/>
					{activeCount > 0 && <ResetFiltersButton onClick={handleReset} />}
				</FilterBar>
			)}

			{isLoading ? (
				<LoadingState className="min-h-48" />
			) : buildings.length === 0 ? (
				<EmptyState icon={Building} title={t("no_buildings")} />
			) : filtered.length === 0 ? (
				<EmptyState
					icon={SearchX}
					title={ta("nothing_found")}
					action={
						<Button variant="outline" size="sm" onClick={handleReset}>
							{ta("reset_filters")}
						</Button>
					}
				/>
			) : (
				<div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
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
		</section>
	);
}
