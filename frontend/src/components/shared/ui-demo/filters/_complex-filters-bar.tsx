"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { DebouncedInput } from "../debounce-input/_debounce_input";

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

const inputClass = "w-full rounded-xl border border-transparent bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-200 focus:bg-white transition-all";

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
    const [expanded, setExpanded] = useState(true);
    const t = useTranslations("filter");
    const tcf = useTranslations("complex_filter");
    const tc = useTranslations("common");

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

    const activeCount = [
        sortBy !== "name_asc",
        logoFilter !== "all",
        minBuildings !== "",
        maxBuildings !== "",
        !!searchValue,
    ].filter(Boolean).length;

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
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
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
                    {hasActiveFilters && (
                        <span
                            onClick={(e) => { e.stopPropagation(); onReset(); }}
                            className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X size={12} />
                            {t("reset")}
                        </span>
                    )}
                    <ChevronDown
                        size={15}
                        className={`text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                    />
                </div>
            </button>

            {expanded && (
                <div className="p-5 flex flex-col gap-5">
                    <div className="relative">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <DebouncedInput
                            placeholder={t("search_complexes")}
                            value={searchValue}
                            onChange={updateSearch}
                            className="w-full rounded-xl border border-transparent bg-gray-50 py-3 pl-10 pr-10 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-200 focus:bg-white transition-all"
                        />
                        {searchValue && (
                            <button
                                type="button"
                                onClick={() => updateSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
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
                                    onClick={() => onSortChange(o.value)}
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
                                {t("logo_label")}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {LOGO_OPTIONS.map((o) => (
                                    <button
                                        key={o.value}
                                        type="button"
                                        onClick={() => onLogoFilterChange(o.value)}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                            logoFilter === o.value
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
                                {t("buildings_count")}
                            </p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    placeholder={tc("from")}
                                    value={minBuildings}
                                    onChange={(e) => onMinBuildingsChange(e.target.value)}
                                    className={inputClass}
                                />
                                <span className="text-gray-300 font-medium">—</span>
                                <input
                                    type="number"
                                    min={0}
                                    placeholder={tc("to")}
                                    value={maxBuildings}
                                    onChange={(e) => onMaxBuildingsChange(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
