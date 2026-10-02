"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FC, useCallback, useMemo } from "react";
import { ImFileEmpty } from "react-icons/im";
import { useTranslations } from "next-intl";
import { useBuildings } from "@/action/hooks/buildings-hook/get-buildings";
import { useComplexes } from "@/action/hooks/complex-hook/get-complexes";
import type { IComplex } from "@/types/complex.types";
import type { TableBuildingsProps } from "@/types/props.types";
import BuildingsFilter from "../filters/_buildings-filter";
import { ModalAddedBuilding } from "../modals/building-modals/modal-add-building/_modal-add-building";
import ModaDataSendingForExel from "../modals/building-modals/modal-sending-for-exel/_modal-sending-for-exel";
import { SpinnerDemo } from "../spinner-demo/_spinner-demo";
import { BuildingCard } from "../cards/_building-card";

const DEFAULT_LIMIT = 12;

const TableBuildings: FC<TableBuildingsProps> = ({
    buildings: initialBuildings,
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const t = useTranslations("building");
    const tc = useTranslations("common");

    const allParams = useMemo(() => {
        const entries = Object.fromEntries(searchParams.entries());
        const limit = Number(entries.limit) || DEFAULT_LIMIT;
        const offset = Number(entries.offset) || 0;

        return {
            ...entries,
            page: Math.floor(offset / limit) + 1,
            limit,
            offset,
            search: entries.name__ilike || undefined,
        };
    }, [searchParams]);

    const { data: buildingsData, isLoading, refetch } = useBuildings(allParams);
    const { data: complexesData } = useComplexes();

    const complexesList = useMemo(() => {
        return Array.isArray(complexesData)
            ? (complexesData as IComplex[])
            : [];
    }, [complexesData]);

    const complexNameById = useMemo(() => {
        const map = new Map<string, string>();
        for (const c of complexesList) map.set(String(c.id), c.name);
        return map;
    }, [complexesList]);

    const displayBuildings = useMemo(() => {
        return Array.isArray(buildingsData)
            ? buildingsData
            : initialBuildings || [];
    }, [buildingsData, initialBuildings]);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const currentPage = allParams.page;

    const handlePageChange = useCallback(
        (pageNumber: number) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("offset", String((pageNumber - 1) * allParams.limit));
            router.push(
                `${pathname}?${params.toString()}` as __next_route_internal_types__.RouteImpl<string>,
                { scroll: false },
            );
        },
        [pathname, router, searchParams, allParams.limit],
    );

    return (
        <section>
            <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">{t("buildings_title")}</h1>
                    <p className="mt-1 text-sm text-gray-400">
                        {t("buildings_subtitle")}
                    </p>
                </div>
                <div className="flex gap-2">
                    <ModalAddedBuilding onSuccess={handleRefresh} />
                    <ModaDataSendingForExel />
                </div>
            </div>

            <BuildingsFilter complexes={complexesList} />

            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <SpinnerDemo />
                    </div>
                )}

                {displayBuildings.length === 0 && !isLoading ? (
                    <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <ImFileEmpty size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm font-medium">
                            {tc("not_found")}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {displayBuildings.map((item) => (
                            <BuildingCard
                                key={item.id}
                                building={item}
                                complexName={complexNameById.get(String(item.complex_id))}
                                onSuccess={handleRefresh}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[13px] text-gray-500">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span>{tc("show_per_page")}</span>
                        <select
                            value={allParams.limit}
                            onChange={(e) => {
                                const params = new URLSearchParams(
                                    searchParams.toString(),
                                );
                                params.set("limit", e.target.value);
                                params.set("offset", "0");
                                router.push(
                                    `${pathname}?${params.toString()}` as __next_route_internal_types__.RouteImpl<string>,
                                    { scroll: false },
                                );
                            }}
                            className="border border-gray-200 rounded-lg px-1.5 py-1 bg-white"
                        >
                            {[12, 20, 50, 100].map((val) => (
                                <option key={val} value={val}>
                                    {val}
                                </option>
                            ))}
                        </select>
                    </div>
                    <p>
                        {tc("found")}{" "}
                        <span className="font-medium text-gray-800">
                            {displayBuildings.length}
                        </span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30"
                    >
                        {tc("prev")}
                    </button>

                    <span className="text-indigo-700 font-medium">
                        {tc("page")} {currentPage}
                    </span>

                    <button
                        type="button"
                        disabled={displayBuildings.length < allParams.limit}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30"
                    >
                        {tc("next")}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TableBuildings;
