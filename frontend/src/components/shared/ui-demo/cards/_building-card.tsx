"use client";

import Link from "next/link";
import { ArrowRight, Building } from "lucide-react";
import { useTranslations } from "next-intl";
import { ModalDeleteBuildings } from "../modals/building-modals/modal-delete-buildings/_modal-delete-buildings";
import type { IBuildings } from "@/types/building.types";
import { formatNumber } from "@/lib/format";

interface BuildingCardProps {
    building: IBuildings;
    complexName?: string;
    onSuccess?: () => void;
}

export function BuildingCard({ building, complexName, onSuccess }: BuildingCardProps) {
    const t = useTranslations("building");

    const stats = [
        { label: t("floors_stat"), value: building.floor_count },
        { label: t("price_m2_stat"), value: formatNumber(building.base_price) },
        { label: t("max_coef_stat"), value: building.max_coefficient },
    ];

    return (
        <Link
            href={`/buildings/${building.id}`}
            className="group relative flex flex-col rounded-2xl border border-white/70 bg-white/80 p-4 shadow-xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-100 hover:bg-white hover:shadow-[0_12px_32px_-16px_rgb(30_33_80/0.25)]"
        >
            <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-500">
                    <Building size={18} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        {complexName ?? t("title")}
                    </p>
                    <h3 className="truncate text-base font-semibold leading-snug text-slate-900">
                        {building.name}
                    </h3>
                </div>
                <div
                    className="-mr-1 -mt-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                    <ModalDeleteBuildings buildingId={building.id} onSuccess={onSuccess} />
                </div>
            </div>

            <dl className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/60">
                {stats.map((s) => (
                    <div key={s.label} className="min-w-0 px-2.5 py-2">
                        <dt className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            {s.label}
                        </dt>
                        <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums text-slate-800">
                            {s.value}
                        </dd>
                    </div>
                ))}
            </dl>

            <div className="mt-3 flex items-center justify-between pt-1 text-[13px] font-medium text-slate-500 transition-colors group-hover:text-ink">
                {t("open_btn")}
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
        </Link>
    );
}
