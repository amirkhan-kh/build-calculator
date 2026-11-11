"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SearchInput } from "@/components/shared/kit/search-input";
import { Segmented } from "@/components/shared/kit/segmented";
import { FilterBar, InlineRange, ResetFiltersButton, SortSelect } from "@/components/shared/kit/filter-bar";

export type ComplexSortBy = "name_asc" | "name_desc" | "buildings_desc" | "buildings_asc";
export type ComplexLogoFilter = "all" | "with" | "without";

interface Props {
    sortBy: ComplexSortBy;
    onSortChange: (v: ComplexSortBy) => void;
    logoFilter: ComplexLogoFilter;
    onLogoFilterChange: (v: ComplexLogoFilter) => void;
    minBuildings: string;
    onMinBuildingsChange: (v: string) => void;
    maxBuildings: string;
    onMaxBuildingsChange: (v: string) => void;
    hasActiveFilters: boolean;
    onReset: () => void;
}

export function ComplexFiltersBar({
    sortBy, onSortChange,
    logoFilter, onLogoFilterChange,
    minBuildings, onMinBuildingsChange,
    maxBuildings, onMaxBuildingsChange,
    hasActiveFilters, onReset,
}: Props) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("filter");
    const tcf = useTranslations("complex_filter");

    const SORT_OPTIONS: { value: ComplexSortBy; label: string }[] = [
        { value: "name_asc",       label: tcf("sort_name_asc") },
        { value: "name_desc",      label: tcf("sort_name_desc") },
        { value: "buildings_desc", label: tcf("sort_buildings_desc") },
        { value: "buildings_asc",  label: tcf("sort_buildings_asc") },
    ];

    const LOGO_OPTIONS: { value: ComplexLogoFilter; label: string }[] = [
        { value: "all",     label: tcf("logo_all") },
        { value: "with",    label: tcf("logo_with") },
        { value: "without", label: tcf("logo_without") },
    ];

    const searchValue = searchParams.get("name__ilike") || "";

    const updateSearch = useCallback(
        (value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value.trim()) params.set("name__ilike", value);
            else params.delete("name__ilike");
            params.set("page", "1");
            router.push(
                `${pathname}?${params.toString()}` as __next_route_internal_types__.RouteImpl<string>,
                { scroll: false },
            );
        },
        [pathname, router, searchParams],
    );

    return (
        <FilterBar>
            <SearchInput
                className="w-full sm:w-72"
                value={searchValue}
                onChange={updateSearch}
                debounce={400}
                placeholder={t("search_complexes")}
            />
            <SortSelect
                value={sortBy}
                onChange={(v) => onSortChange(v as ComplexSortBy)}
                options={SORT_OPTIONS}
                className="min-w-[190px]"
            />
            <Segmented value={logoFilter} onChange={onLogoFilterChange} options={LOGO_OPTIONS} />
            <InlineRange
                label={t("buildings_count")}
                min={minBuildings}
                max={maxBuildings}
                onMinChange={onMinBuildingsChange}
                onMaxChange={onMaxBuildingsChange}
                inputClassName="w-[72px]"
            />
            {hasActiveFilters && <ResetFiltersButton onClick={onReset} />}
        </FilterBar>
    );
}
