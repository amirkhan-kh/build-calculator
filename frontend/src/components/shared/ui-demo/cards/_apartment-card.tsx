"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { StatusUpdateCell } from "../patch-status/_status-pach";
import { ModalDeleteApartments } from "../modals/apartments-modals/modal-delete-apartments/_modal-delete-apartment";
import type { IApartment } from "@/types/apartment.types";
import { formatNumber } from "@/lib/format";
import { statusStyle } from "@/lib/apartment-status";
import { cn } from "@/lib/cn";

interface ApartmentCardProps {
    apartment: IApartment;
    onSuccess?: () => void;
}

export function ApartmentCard({ apartment, onSuccess }: ApartmentCardProps) {
    const t = useTranslations("apartment");
    const tf = useTranslations("filter");

    const specs = [
        { label: tf("floor_label"), value: apartment.floor },
        { label: tf("rooms_label"), value: apartment.room_count },
        { label: "м²", value: formatNumber(apartment.area) },
    ];

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-xs backdrop-blur-sm transition-all duration-200 hover:border-indigo-100 hover:bg-white hover:shadow-[0_12px_32px_-16px_rgb(30_33_80/0.25)]">
            <span className={cn("absolute inset-y-0 left-0 w-[3px]", statusStyle(apartment.status).bar)} />

            <div className="flex flex-1 flex-col p-4 pl-5">
                <div className="flex items-start justify-between gap-2">
                    <Link href={`/apartments/${apartment.id}`} className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            {t("title")}
                        </p>
                        <h3 className="text-lg font-semibold leading-tight tracking-tight text-slate-900 hover:text-ink">
                            №{apartment.number}
                        </h3>
                    </Link>
                    <StatusUpdateCell apartment={apartment} />
                </div>

                <dl className="mt-3 flex items-center gap-4 text-[13px]">
                    {specs.map((s) => (
                        <div key={s.label} className="flex items-baseline gap-1">
                            <dd className="font-semibold tabular-nums text-slate-800">{s.value}</dd>
                            <dt className="text-xs text-slate-400">{s.label}</dt>
                        </div>
                    ))}
                </dl>

                <div className="mt-3 flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
                    <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold tabular-nums text-slate-900">
                            {formatNumber(apartment.total_price)}
                            <span className="ml-1 text-[11px] font-medium text-slate-400">{apartment.price_unit}</span>
                        </p>
                        <p className="truncate text-[11px] tabular-nums text-slate-400">
                            {formatNumber(apartment.final_price)} {apartment.price_unit} / м²
                        </p>
                    </div>
                    <div className="flex items-center">
                        <Link
                            href={`/apartments/${apartment.id}`}
                            className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            aria-label={t("title")}
                        >
                            <ArrowUpRight size={16} />
                        </Link>
                        <ModalDeleteApartments apartmentId={apartment.id} onSuccess={onSuccess} />
                    </div>
                </div>
            </div>
        </div>
    );
}
