"use client";

import React, { useCallback, useMemo, useState } from "react";
import { AlertCircle, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/kit/page-header";
import { EmptyState, LoadingState } from "@/components/shared/kit/empty-state";
import { Pagination } from "@/components/shared/kit/pagination";
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


    if (isLoading) return <LoadingState className="min-h-96" />;

    if (error)
        return (
            <EmptyState
                icon={AlertCircle}
                title={t("load_error")}
                action={
                    <Button variant="outline" onClick={() => refetch()}>
                        {t("retry_btn")}
                    </Button>
                }
            />
        );

    return (
        <section>
            <PageHeader
                title={t("title")}
                description={t("subtitle")}
                actions={<ModalAddedComplex onSuccess={handleRefresh} />}
            />

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
                <EmptyState
                    icon={SearchX}
                    title={t("nothing_found")}
                    description={tc("try_change_filters")}
                />
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
                    {currentItems.map((item) => (
                        <ComplexCard key={item.id} complex={item} />
                    ))}
                </div>
            )}

            <div className="mt-6 flex flex-col items-center justify-between gap-3 text-[13px] text-slate-500 sm:flex-row">
                <p>
                    {t("shown_of", {
                        from: filteredAndSorted.length > 0 ? startIndex + 1 : 0,
                        to: Math.min(startIndex + ITEMS_PER_PAGE, filteredAndSorted.length),
                        total: filteredAndSorted.length,
                    })}
                </p>
                <Pagination page={currentPage} totalPages={totalPages} onChange={handlePageChange} />
            </div>
        </section>
    );
};

export default TableObjects;
