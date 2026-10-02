"use client";

import Image from "next/image";
import Link from "next/link";
import { HiMiniBuildingOffice2 } from "react-icons/hi2";
import { ArrowUpRight } from "lucide-react";
import { ModalDeleteComplex } from "../modals/complex-modal/modal-delete-complex/_modal-delete-complex";
import type { IComplex } from "@/types/complex.types";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface ComplexCardProps {
    complex: IComplex;
}

export function ComplexCard({ complex }: ComplexCardProps) {
    const router = useRouter();
    const t = useTranslations("complex");
    const buildingsCount = complex.buildings_count ?? 0;
    const label =
        buildingsCount === 1 ? t("buildings_one")
        : buildingsCount >= 2 && buildingsCount <= 4 ? t("buildings_few")
        : t("buildings_many");

    return (
        <Link
            href={`/complex/${complex.id}`}
            className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-100 overflow-hidden"
        >
            {/* Delete — поверх баннера */}
            <div
                className="absolute right-3 top-3 z-20"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                <ModalDeleteComplex
                    complexId={complex.id}
                    onSuccess={() => router.refresh()}
                />
            </div>

            {/* Баннер 16:9 */}
            <div className="relative w-full" style={{ paddingBottom: "52%" }}>
                {complex.logo_url ? (
                    <Image
                        src={complex.logo_url}
                        alt={complex.name}
                        fill
                        unoptimized
                        className="object-contain p-5 bg-gradient-to-br from-indigo-50 to-slate-100"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100">
                        <HiMiniBuildingOffice2 size={48} className="text-indigo-200" />
                    </div>
                )}

                {/* Бейдж зданий поверх баннера */}
                <span className="absolute bottom-2.5 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-indigo-700 shadow-sm border border-indigo-100">
                    {buildingsCount} {label}
                </span>
            </div>

            {/* Контент */}
            <div className="flex flex-1 flex-col p-4">
                <h3 className="truncate text-sm font-bold text-gray-900 capitalize leading-snug">
                    {complex.name}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs text-gray-400 leading-relaxed flex-1">
                    {complex.description || t("no_description")}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                    <span className="text-xs font-medium text-gray-400">{t("open_btn")}</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all duration-200 group-hover:bg-indigo-600 group-hover:text-white">
                        <ArrowUpRight size={14} />
                    </span>
                </div>
            </div>
        </Link>
    );
}
