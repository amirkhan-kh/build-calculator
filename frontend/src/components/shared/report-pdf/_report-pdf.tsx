"use client";

import Image from "next/image";
import { forwardRef, useMemo } from "react";
import { useAuthMe } from "@/action/hooks/login-hook/use-auth-me";
import { useTranslations, useLocale } from "next-intl";
import type { CalculatePricingResponse } from "@/types/calculator.types";

interface Props {
    data: CalculatePricingResponse;
    apartmentNumber: string;
    imgUrl?: string;
    priceUnit: number | string;
    layoutImageUrl?: string;
}

export const ReportTemplate = forwardRef<HTMLDivElement, Props>(
    ({ data, apartmentNumber, imgUrl, priceUnit, layoutImageUrl }, ref) => {
        const { data: userData, isLoading } = useAuthMe();
        const t = useTranslations("calculator");
        const tc = useTranslations("common");
        const locale = useLocale();

        const formatter = useMemo(
            () => new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }),
            [locale]
        );
        const formatCurrency = useMemo(
            () => (val: number) => formatter.format(val),
            [formatter]
        );

        const todayStr = useMemo(
            () => new Date().toLocaleDateString(locale),
            [locale]
        );

        const formattedDates = useMemo(
            () => data.payment_dates.map((d) => new Date(d).toLocaleDateString(locale)),
            [data.payment_dates, locale]
        );

        const formattedMonthlyPayment = useMemo(
            () => formatCurrency(data.monthly_payment),
            [data.monthly_payment, formatCurrency]
        );

        const formattedMonthlyPaymentShort = useMemo(
            () => new Intl.NumberFormat(locale).format(data.monthly_payment),
            [locale, data.monthly_payment]
        );

        const specialistFullName =
            userData?.data?.fullname || (isLoading ? "..." : tc("not_specified"));
        const specialistPhone =
            userData?.data?.phone || (isLoading ? "..." : tc("not_specified"));

        return (
            <div ref={ref}>
                <div className="px-24 py-4 bg-white text-black mx-auto">
                    <div className="flex justify-between border-b-2 border-[#7107e7] items-end mb-2">
                        <div className="flex items-end gap-3">
                            {imgUrl && (
                                <div className="relative w-10 h-10 flex-shrink-0">
                                    <Image
                                        fill
                                        unoptimized
                                        src={imgUrl}
                                        alt="complex logo"
                                        className="object-contain"
                                    />
                                </div>
                            )}
                            <h1 className="text-md font-bold uppercase text-[#46479f]">
                                {t("report_title_header")}
                            </h1>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] text-gray-500">
                                {t("date_label")} {todayStr}
                            </p>
                            <div className="text-[10px] font-medium flex gap-2.5">
                                <p>
                                    {t("manager_label")}{" "}
                                    <strong className="font-bold uppercase">
                                        {specialistFullName}
                                    </strong>
                                </p>
                                <p>{specialistPhone}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-4">
                        <div>
                            <h3 className="text-gray-400 uppercase text-xs font-bold mb-2">
                                {t("object_label")}
                            </h3>
                            <p className="text-lg font-semibold">
                                {t("apartment_label")} №{apartmentNumber}
                            </p>
                            <p className="text-sm">
                                {t("block_label")}: {data.block} | {t("floor_label")}: {data.floor}
                            </p>
                            <p className="text-sm">{t("area_label")}: {data.area} м²</p>
                        </div>
                        <div className="bg-[#f0f3ff] p-4 rounded-sm flex items-center justify-between">
                            <div>
                                <h3 className="text-[#46479f] uppercase text-xs font-bold mb-2">
                                    {t("monthly_payment")}
                                </h3>
                                <p className="text-2xl font-black text-[#46479f]">
                                    {formattedMonthlyPaymentShort}
                                    <span className="text-[10px] text-gray-500">
                                        {priceUnit}
                                    </span>
                                </p>
                            </div>

                        </div>
                    </div>

                    <table className="w-full border-collapse mb-4">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-1 border text-xs text-center px-6">№</th>
                                <th className="py-1 border text-xs text-center px-6">
                                    {t("payment_date_col")}
                                </th>
                                <th className="py-1 border text-xs text-center px-6">
                                    {t("payment_total_col")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {formattedDates.length > 0 ? (
                                formattedDates.map((dateStr, index) => (
                                    <tr
                                        key={index.toString()}
                                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                    >
                                        <td className="py-1 px-6 border text-[8px] text-center">
                                            {index + 1}
                                        </td>
                                        <td className="py-1 px-6 border text-[8px] text-center">
                                            {dateStr}
                                        </td>
                                        <td className="py-1 px-6 border text-[8px] text-center">
                                            {formattedMonthlyPayment}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="p-10 text-center text-gray-400 text-xs"
                                    >
                                        {t("empty_schedule")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="bg-gray-50 p-2 border-l-4 border-[#7107e7]">
                        <p className="uppercase text-xs font-bold text-[#46479f]">
                            {t("total_to_pay")} {formatCurrency(data.new_total_price)}
                        </p>
                    </div>
                </div>

                {layoutImageUrl && (
                    <div
                        className="px-24 py-4 bg-white text-black mx-auto flex flex-col"
                        style={{ pageBreakBefore: "always" }}
                    >
                        <div className="flex justify-between border-b-2 border-[#7107e7] items-end mb-6">
                            <h1 className="text-md font-bold uppercase text-[#46479f]">
                                {t("layout_page_title")}{apartmentNumber}
                            </h1>
                            <p className="text-[9px] text-gray-500">
                                {t("date_label")} {todayStr}
                            </p>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <Image
                                unoptimized
                                src={layoutImageUrl}
                                alt="layout"
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="w-full h-auto object-contain"
                                style={{ maxHeight: "220mm" }}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    },
);

ReportTemplate.displayName = "ReportTemplate";
