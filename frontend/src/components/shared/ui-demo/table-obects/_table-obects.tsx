"use client";

import React, { useCallback, useMemo, useState } from "react";
import { ImFileEmpty } from "react-icons/im";
import { SpinnerDemo } from "../spinner-demo/_spinner-demo";
import { ModalAddedComplex } from "../modals/complex-modal/modal-add-complex/_modal-add-complex";
import { useComplexes } from "@/action/hooks/complex-hook/get-complexes";
import type { TableComplexProps } from "@/types/props.types";
import { IComplex } from "@/types/complex.types";
import { ComplexCard } from "../cards/_complex-card";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    ComplexFiltersBar,
    type ComplexSortBy,
    type ComplexLogoFilter,
} from "../filters/_complex-filters-bar";
import { useTranslations } from "next-intl";

const ITEMS_PER_PAGE = 12;
const MAX_VISIBLE_PAGES = 5;

const DEFAULT_SORT: ComplexSortBy = "name_asc";
const DEFAULT_LOGO: ComplexLogoFilter = "all";

const TableObjects: React.FC<TableComplexProps> = ({ initialComplex }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const t = useTranslations("complex");
    const tc = useTranslations("common");

    const currentPage = Number(searchParams.get("page")) || 1;
    const searchTerm = searchParams.get("name__ilike") || "";

    const [sortBy, setSortBy] = useState<ComplexSortBy>(DEFAULT_SORT);
    const [logoFilter, setLogoFilter] = useState<ComplexLogoFilter>(DEFAULT_LOGO);
    const [minBuildings, setMinBuildings] = useState("");
    const [maxBuildings, setMaxBuildings] = useState("");

    const {
        data: complexData,
        isLoading,
        error,
        refetch,
    } = useComplexes({ name__ilike: searchTerm });

    const handleRefresh = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const complexList = useMemo(() => {
        if (Array.isArray(complexData)) return complexData as IComplex[];
        return (initialComplex as IComplex[]) || [];
    }, [complexData, initialComplex]);

    const filteredAndSorted = useMemo(() => {
        let list = [...complexList];

        // Фильтр по лого
        if (logoFilter === "with") list = list.filter((c) => !!c.logo_url);
        if (logoFilter === "without") list = list.filter((c) => !c.logo_url);

        // Фильтр по кол-ву зданий
        const min = minBuildings !== "" ? Number(minBuildings) : null;
        const max = maxBuildings !== "" ? Number(maxBuildings) : null;
        if (min !== null) list = list.filter((c) => (c.buildings_count ?? 0) >= min);
        if (max !== null) list = list.filter((c) => (c.buildings_count ?? 0) <= max);

        // Сортировка
        list.sort((a, b) => {
            switch (sortBy) {
                case "name_asc":
                    return a.name.localeCompare(b.name, "ru");
                case "name_desc":
                    return b.name.localeCompare(a.name, "ru");
                case "buildings_desc":
                    return (b.buildings_count ?? 0) - (a.buildings_count ?? 0);
                case "buildings_asc":
                    return (a.buildings_count ?? 0) - (b.buildings_count ?? 0);
                default:
                    return 0;
            }
        });

        return list;
    }, [complexList, sortBy, logoFilter, minBuildings, maxBuildings]);

    const hasActiveFilters =
        sortBy !== DEFAULT_SORT ||
        logoFilter !== DEFAULT_LOGO ||
        minBuildings !== "" ||
        maxBuildings !== "";

    const handleReset = useCallback(() => {
        setSortBy(DEFAULT_SORT);
        setLogoFilter(DEFAULT_LOGO);
        setMinBuildings("");
        setMaxBuildings("");
        const params = new URLSearchParams(searchParams.toString());
        params.delete("name__ilike");
        params.set("page", "1");
        router.push(
            `${pathname}?${params.toString()}` as __next_route_internal_types__.RouteImpl<string>,
            { scroll: false },
        );
    }, [pathname, router, searchParams]);

    const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredAndSorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = useCallback(
        (newPage: number) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(newPage));
            router.push(
                `${pathname}?${params.toString()}` as __next_route_internal_types__.RouteImpl<string>,
                { scroll: false },
            );
        },
        [pathname, router, searchParams],
    );

    const paginationPages = useMemo(() => {
        let start = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
        let end = start + MAX_VISIBLE_PAGES - 1;
        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);
        }
        return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
    }, [currentPage, totalPages]);

    if (isLoading)
        return (
            <div className="flex justify-center items-center min-h-96">
                <SpinnerDemo />
            </div>
        );

    if (error)
        return (
            <div className="text-center p-8 border rounded-2xl">
                <p className="text-red-500 mb-4">{t("load_error")}</p>
                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors"
                >
                    {t("retry_btn")}
                </button>
            </div>
        );

    return (
        <section>
            <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">{t("title")}</h1>
                    <p className="mt-1 text-sm text-gray-400">
                        {t("subtitle")}
                    </p>
                </div>
                <ModalAddedComplex onSuccess={handleRefresh} />
            </div>

            <ComplexFiltersBar
                sortBy={sortBy}
                onSortChange={setSortBy}
                logoFilter={logoFilter}
                onLogoFilterChange={setLogoFilter}
                minBuildings={minBuildings}
                onMinBuildingsChange={setMinBuildings}
                maxBuildings={maxBuildings}
                onMaxBuildingsChange={setMaxBuildings}
                hasActiveFilters={hasActiveFilters || !!searchTerm}
                onReset={handleReset}
            />

            {filteredAndSorted.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <ImFileEmpty size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm font-medium">{t("nothing_found")}</p>
                    <p className="text-xs text-gray-400 mt-1">{tc("try_change_filters")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {currentItems.map((item) => (
                        <ComplexCard key={item.id} complex={item} />
                    ))}
                </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[13px] text-gray-500">
                <p>
                    {t("shown_of", {
                        from: filteredAndSorted.length > 0 ? startIndex + 1 : 0,
                        to: Math.min(startIndex + ITEMS_PER_PAGE, filteredAndSorted.length),
                        total: filteredAndSorted.length,
                    })}
                </p>

                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="px-2 py-1 text-gray-400 disabled:opacity-30 hover:text-indigo-600 transition-colors"
                        >
                            ‹
                        </button>
                        {paginationPages.map((p) => (
                            <button
                                key={p}
                                onClick={() => handlePageChange(p)}
                                className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all ${
                                    p === currentPage
                                        ? "bg-indigo-600 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="px-2 py-1 text-gray-400 disabled:opacity-30 hover:text-indigo-600 transition-colors"
                        >
                            ›
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default TableObjects;
