"use client";

import Link from "next/link";
import { TbExternalLink } from "react-icons/tb";
import { useTranslations } from "next-intl";
import { StatusUpdateCell } from "../patch-status/_status-pach";
import { ModalDeleteApartments } from "../modals/apartments-modals/modal-delete-apartments/_modal-delete-apartment";
import type { IApartment } from "@/types/apartment.types";

interface ApartmentCardProps {
    apartment: IApartment;
    onSuccess?: () => void;
}

export function ApartmentCard({ apartment, onSuccess }: ApartmentCardProps) {
    const t = useTranslations("apartment");
    const tf = useTranslations("filter");

    return (
        <div className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-indigo-100 overflow-hidden">
            <div className={`h-0.5 w-full ${
                apartment.status === "free"      ? "bg-green-400" :
                apartment.status === "sold"      ? "bg-red-400" :
                apartment.status === "booked"    ? "bg-yellow-400" :
                "bg-gray-300"
            }`} />

            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                            {t("title")}
                        </p>
                        <h3 className="text-lg font-black text-gray-900 leading-tight">
                            №{apartment.number}
                        </h3>
                    </div>
                    <StatusUpdateCell apartment={apartment} />
                </div>

                <div className="grid grid-cols-3 gap-1.5 mb-3">
                    <div className="rounded-xl bg-gray-50 px-2 py-2 text-center">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                            {tf("floor_label")}
                        </p>
                        <p className="mt-0.5 text-sm font-black text-gray-800">
                            {apartment.floor}
                        </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-2 py-2 text-center">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                            {tf("rooms_label")}
                        </p>
                        <p className="mt-0.5 text-sm font-black text-gray-800">
                            {apartment.room_count}
                        </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-2 py-2 text-center">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                            м²
                        </p>
                        <p className="mt-0.5 text-sm font-black text-gray-800">
                            {apartment.area}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-auto">
                    <div>
                        <p className="text-sm font-black text-indigo-600">
                            {Number(apartment.total_price).toLocaleString()}{" "}
                            <span className="text-[10px] font-medium">{apartment.price_unit}</span>
                        </p>
                        <p className="text-[10px] text-gray-400">
                            {Number(apartment.final_price).toLocaleString()} {apartment.price_unit} / м²
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Link
                            href={`/apartments/${apartment.id}`}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                            <TbExternalLink size={16} />
                        </Link>
                        <ModalDeleteApartments
                            apartmentId={apartment.id}
                            onSuccess={onSuccess}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
