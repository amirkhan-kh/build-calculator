"use client";

import { TbExternalLink } from "react-icons/tb";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ModalDeleteBuildings } from "../modals/building-modals/modal-delete-buildings/_modal-delete-buildings";
import type { IBuildings } from "@/types/building.types";

interface BuildingCardProps {
    building: IBuildings;
    complexName?: string;
    onSuccess?: () => void;
}

export function BuildingCard({ building, complexName, onSuccess }: BuildingCardProps) {
    const price = Number(building.base_price).toLocaleString();
    const router = useRouter();
    const t = useTranslations("building");

    return (
        <div
            className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-indigo-100 overflow-hidden cursor-pointer"
            onClick={() => router.push(`/buildings/${building.id}`)}
        >
            <div className="h-0.5 w-full bg-indigo-400" />

            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                            {complexName ?? t("title")}
                        </p>
                        <h3 className="text-lg font-black text-gray-900 leading-tight capitalize">
                            {building.name}
                        </h3>
                    </div>
                    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                        <ModalDeleteBuildings buildingId={building.id} onSuccess={onSuccess} />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 mb-3">
                    <div className="rounded-xl bg-gray-50 px-2 py-2 text-center">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                            {t("floors_stat")}
                        </p>
                        <p className="mt-0.5 text-sm font-black text-gray-800">
                            {building.floor_count}
                        </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-2 py-2 text-center">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                            {t("price_m2_stat")}
                        </p>
                        <p className="mt-0.5 text-sm font-black text-gray-800 truncate">
                            {price}
                        </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-2 py-2 text-center">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                            {t("max_coef_stat")}
                        </p>
                        <p className="mt-0.5 text-sm font-black text-gray-800">
                            {building.max_coefficient}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-auto">
                    <span className="text-xs font-semibold text-gray-400 group-hover:text-indigo-500 transition-colors">
                        {t("open_btn")}
                    </span>
                    <span className="rounded-lg p-1.5 text-gray-400 group-hover:text-indigo-600 transition-colors">
                        <TbExternalLink size={16} />
                    </span>
                </div>
            </div>
        </div>
    );
}
