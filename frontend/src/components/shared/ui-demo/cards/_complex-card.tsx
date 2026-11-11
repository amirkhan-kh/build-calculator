"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { ModalDeleteComplex } from "../modals/complex-modal/modal-delete-complex/_modal-delete-complex";
import type { IComplex } from "@/types/complex.types";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface ComplexCardProps {
    complex: IComplex;
}

export function monogram(name: string) {
    const words = name.replace(/["'«»]/g, "").trim().split(/\s+/).filter(Boolean);
    return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase() || "—";
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
            className="group relative flex flex-col rounded-2xl border border-white/70 bg-white/80 p-4 shadow-xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-100 hover:bg-white hover:shadow-[0_12px_32px_-16px_rgb(30_33_80/0.25)]"
        >
            <div
                className="absolute right-3 top-3 z-10 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                <ModalDeleteComplex complexId={complex.id} onSuccess={() => router.refresh()} />
            </div>

            <div className="flex items-start gap-3.5 pr-8">
                <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200/80 bg-white">
                    {complex.logo_url ? (
                        <Image
                            src={complex.logo_url}
                            alt={complex.name}
                            fill
                            unoptimized
                            sizes="56px"
                            className="object-contain p-1.5"
                        />
                    ) : (
                        <span className="text-base font-semibold tracking-tight text-ink/70">
                            {monogram(complex.name)}
                        </span>
                    )}
                </div>
                <div className="min-w-0 pt-0.5">
                    <h3 className="truncate text-[15px] font-semibold leading-snug text-slate-900">
                        {complex.name}
                    </h3>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Building2 size={13} className="text-indigo-400" />
                        {buildingsCount} {label}
                    </span>
                </div>
            </div>

            <p className="mt-3 line-clamp-2 min-h-[2.5rem] flex-1 text-[13px] leading-5 text-slate-500">
                {complex.description || t("no_description")}
            </p>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[13px] font-medium text-slate-500 transition-colors group-hover:text-ink">
                {t("open_btn")}
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
        </Link>
    );
}
