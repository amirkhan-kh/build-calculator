"use client";

import {
    Building as BuildingIcon,
    ChevronRight,
    CreditCard,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { useApartments } from "@/action/hooks/apartments-hook/get-apartments.hook";
import { useBuildings } from "@/action/hooks/buildings-hook/get-buildings";
import { useCalculatePricing } from "@/action/hooks/calculator-hook/calculator.hook";
import { useComplexes } from "@/action/hooks/complex-hook/get-complexes";
import { useLayoutsByBuilding } from "@/action/hooks/layouts-hook/get-layouts.hook";
import type { IApartment, TApartmentStatus } from "@/types/apartment.types";
import type { IBuildings } from "@/types/building.types";
import type {
    CalculatePricingPayload,
    CalculatePricingResponse,
    InvestmentType,
} from "@/types/calculator.types";
import type { IComplex } from "@/types/complex.types";
import type { SafeResponse } from "@/types/safe-response.types";
import { ReportTemplate } from "../report-pdf/_report-pdf";

const statusClassName: Record<TApartmentStatus, string> = {
    free:      "bg-green-100 text-green-700 border border-green-200",
    sold:      "bg-red-100 text-red-700 border border-red-200",
    booked:    "bg-yellow-100 text-yellow-700 border border-yellow-200",
    withdrawn: "bg-gray-100 text-gray-500 border border-gray-300",
};

const EMPTY_DATA: CalculatePricingResponse = {
    block: "-",
    floor: 0,
    area: 0,
    first_investment_rate: 0,
    first_payment_date: "",
    period_count: 0,
    old_price_per_sqrm: 0,
    new_price_per_sqrm: 0,
    old_total_price: 0,
    new_total_price: 0,
    monthly_payment: 0,
    payment_dates: [],
};

function formatDay(date: string): string {
    if (!date || date.length < 10) return "-";
    const day = date.slice(8, 10);
    return day.startsWith("0") ? day[1] : day;
}

export const CalculatorClientPage: React.FC = () => {
    const componentRef = useRef<HTMLDivElement>(null);
    const [selectedComplexId, setSelectedComplexId] = useState("");
    const [selectedBuildingId, setSelectedBuildingId] = useState("");
    const [selectedApartmentId, setSelectedApartmentId] = useState("");
    const [result, setResult] = useState<CalculatePricingResponse | null>(null);
    const [investmentType, setInvestmentType] = useState<InvestmentType>("percentage");
    const [formData, setFormData] = useState<CalculatePricingPayload>({
        first_investment_rate: 15,
        first_payment_date: "2026-02-20",
        period_count: 12,
    });
    const [pricePerSqrm, setPricePerSqrm] = useState<string>("");

    const t = useTranslations("calculator");
    const ts = useTranslations("status");
    const locale = useLocale();

    const { data: complexesData = [] } = useComplexes();
    const { data: buildingsData = [] } = useBuildings(
        selectedComplexId ? { complex_id: Number(selectedComplexId) } : null
    );
    const { data: apartmentsData = [] } = useApartments(
        selectedBuildingId ? { building_id: Number(selectedBuildingId) } : null
    );
    const { data: layoutsData = [] } = useLayoutsByBuilding(selectedBuildingId || null);

    const complexes = (complexesData || []) as IComplex[];
    // Backend filters by complex_id / building_id — no client-side filtering needed
    const buildings = (buildingsData || []) as IBuildings[];
    const apartments = (apartmentsData || []) as IApartment[];

    const buildingUnitPrice = useMemo(
        () => buildings.find((b) => String(b.id) === String(selectedBuildingId))?.price_unit ?? 0,
        [buildings, selectedBuildingId]
    );
    const complexLogoUrl = useMemo(
        () => complexes.find((c) => String(c.id) === String(selectedComplexId))?.logo_url,
        [complexes, selectedComplexId]
    );
    const calculateMutation = useCalculatePricing();

    const foundApartment = useMemo(
        () => apartments.find((a) => String(a.id) === String(selectedApartmentId)) ?? null,
        [apartments, selectedApartmentId]
    );

    const layoutImageUrl = useMemo(() => {
        if (!foundApartment || !layoutsData.length) return undefined;
        const match = layoutsData.find(
            (l) =>
                l.room_count === foundApartment.room_count &&
                Number(l.area) === Number(foundApartment.area),
        );
        return match?.image_url ?? undefined;
    }, [foundApartment, layoutsData]);

    const displayData = result ?? EMPTY_DATA;

    const formatter = useMemo(
        () => new Intl.NumberFormat(locale, { minimumFractionDigits: 0 }),
        [locale]
    );
    const formatCurrency = useCallback(
        (val: number) => formatter.format(val),
        [formatter]
    );

    const sliderPercentage = useMemo(
        () => ((formData.period_count - 1) / 59) * 100,
        [formData.period_count]
    );

    const apartmentStatus = foundApartment?.status ?? "";

    const handleInvestmentRateChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({ ...prev, first_investment_rate: Number(e.target.value) })),
        []
    );

    const handlePeriodChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({ ...prev, period_count: Number(e.target.value) })),
        []
    );

    const handleDateChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({ ...prev, first_payment_date: e.target.value })),
        []
    );

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApartmentId) return toast.error(t("select_apartment_error"));

        try {
            const payload: CalculatePricingPayload = { ...formData };
            if (pricePerSqrm && Number(pricePerSqrm) > 0) {
                payload.price_per_sqrm = Number(pricePerSqrm);
            }
            const response = await calculateMutation.mutateAsync({
                apartmentId: Number(selectedApartmentId),
                payload,
                investmentType: investmentType,
            });

            const typedResponse = response as SafeResponse<CalculatePricingResponse>;
            if (typedResponse?.data) {
                setResult(typedResponse.data);
            }
        } catch (err) {
            toast.error(String(err));
        }
    }, [selectedApartmentId, formData, pricePerSqrm, investmentType, calculateMutation, t]);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `report_${selectedApartmentId}`,
    });

    return (
        <div className="p-1">
            <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2 space-y-5">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-xl font-black text-gray-900 mb-6">
                            {t("payment_settings")}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex gap-4">
                                <div className="space-y-2 flex-1">
                                    <label htmlFor="complex" className="text-sm font-medium">
                                        {t("complex_label")}
                                    </label>
                                    <select
                                        id="complex"
                                        value={selectedComplexId}
                                        onChange={(e) => {
                                            setSelectedComplexId(e.target.value);
                                            setSelectedBuildingId("");
                                            setSelectedApartmentId("");
                                        }}
                                        className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required
                                    >
                                        <option value="">{t("select_complex")}</option>
                                        {complexes.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 flex-1">
                                    <label htmlFor="building" className="text-sm font-medium">
                                        {t("building_label")}
                                    </label>
                                    <select
                                        id="building"
                                        value={selectedBuildingId}
                                        onChange={(e) => {
                                            setSelectedBuildingId(e.target.value);
                                            setSelectedApartmentId("");
                                        }}
                                        className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        disabled={!selectedComplexId}
                                        required
                                    >
                                        <option value="">{t("select_building")}</option>
                                        {buildings.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                    {selectedComplexId && buildings.length === 0 && (
                                        <span className="text-xs text-amber-600 font-normal italic">
                                            {t("no_buildings")}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-5 items-end justify-between">
                                    <div className="space-y-2 flex flex-col flex-1">
                                        <label htmlFor="home" className="text-sm font-medium text-gray-700">
                                            {t("apartment_label")}
                                        </label>
                                        <select
                                            id="home"
                                            value={selectedApartmentId}
                                            onChange={(e) => {
                                                const apt = apartments.find(
                                                    (a) => String(a.id) === e.target.value,
                                                );
                                                setSelectedApartmentId(e.target.value);
                                                setPricePerSqrm(apt ? String(apt.final_price) : "");
                                            }}
                                            className="w-[63%] p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50 flex-1"
                                            disabled={!selectedBuildingId}
                                            required
                                        >
                                            <option value="">{t("select_apartment")}</option>
                                            {apartments.map((a) => (
                                                <option key={a.id} value={a.id}>
                                                    №{a.number} - {a.area} м² ({a.floor} - {t("floor_label")})
                                                </option>
                                            ))}
                                        </select>
                                        {selectedBuildingId && apartments.length === 0 && (
                                            <span className="text-xs text-amber-600 font-normal italic">
                                                {t("no_apartments")}
                                            </span>
                                        )}
                                    </div>

                                    {apartmentStatus && (
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${statusClassName[apartmentStatus as TApartmentStatus] ?? "bg-gray-100 text-gray-500"}`}>
                                            {ts(apartmentStatus as TApartmentStatus)}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="type" className="text-sm font-semibold text-gray-700">
                                                {t("investment_type_label")}
                                            </label>
                                            <select
                                                id="type"
                                                value={investmentType}
                                                onChange={(e) => {
                                                    setInvestmentType(e.target.value as InvestmentType);
                                                    setFormData((prev) => ({ ...prev, first_investment_rate: 0 }));
                                                }}
                                                className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                <option value="percentage">{t("percentage_option")}</option>
                                                <option value="amount">{t("amount_option", { unit: buildingUnitPrice })}</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="unit-price" className="text-sm font-semibold text-gray-700">
                                                {investmentType === "percentage" ? t("rate_label") : t("amount_label")}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="unit-price"
                                                    type="number"
                                                    value={formData.first_investment_rate || ""}
                                                    onChange={handleInvestmentRateChange}
                                                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none pr-12 font-bold"
                                                    placeholder="0"
                                                />
                                                <span
                                                    role="none"
                                                    className="absolute right-3 top-2.5 text-gray-400 text-sm font-bold"
                                                >
                                                    {investmentType === "percentage" ? "%" : buildingUnitPrice}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {investmentType === "percentage" && (
                                        <div className="pt-2">
                                            <div className="relative w-full px-1.5">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={formData.first_investment_rate}
                                                    onChange={handleInvestmentRateChange}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                    style={{
                                                        background: `linear-gradient(to right, #47479f 0%, #3b82f6 ${formData.first_investment_rate}%, #e5e7eb ${formData.first_investment_rate}%, #e5e7eb 100%)`,
                                                    }}
                                                />
                                            </div>
                                            <div className="relative w-full h-4 mt-1">
                                                <span className="absolute left-0 text-[10px] text-gray-400 font-bold uppercase">0%</span>
                                                <span className="absolute left-1/4 -translate-x-1/5 text-[10px] text-gray-400 font-bold uppercase">25%</span>
                                                <span className="absolute left-1/2 -translate-x-1/3 text-[10px] text-gray-400 font-bold uppercase">50%</span>
                                                <span className="absolute left-3/4 -translate-x-1/2 text-[10px] text-gray-400 font-bold uppercase">75%</span>
                                                <span className="absolute right-0 text-[10px] text-gray-400 font-bold uppercase">100%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>{t("period_label")}</span>
                                        <span className="text-indigo-600 font-bold">
                                            {formData.period_count} {t("months")}
                                        </span>
                                    </div>
                                    <div className="relative w-full px-1">
                                        <input
                                            type="range"
                                            min="1"
                                            max="60"
                                            value={formData.period_count}
                                            onChange={handlePeriodChange}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer relative z-10"
                                            style={{
                                                background: `linear-gradient(to right, #47479f 0%, #3b82f6 ${sliderPercentage}%, #e5e7eb ${sliderPercentage}%, #e5e7eb 100%)`,
                                            }}
                                        />
                                    </div>
                                    <div className="relative w-full h-4 mt-1">
                                        <span className="absolute left-0 text-[10px] text-gray-400 font-bold uppercase">1 {t("months")}</span>
                                        <span className="absolute left-[19.6%] -translate-x-1/2 text-[10px] text-gray-400 font-bold uppercase">12</span>
                                        <span className="absolute left-[39%] -translate-x-1/2 text-[10px] text-gray-400 font-bold uppercase">24</span>
                                        <span className="absolute left-[59.3%] -translate-x-1/2 text-[10px] text-gray-400 font-bold uppercase">36</span>
                                        <span className="absolute left-[78.6%] -translate-x-1/2 text-[10px] text-gray-400 font-bold uppercase">48</span>
                                        <span className="absolute right-0 text-[10px] text-gray-400 font-bold uppercase">60 {t("months")}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="date-pay" className="text-sm font-medium text-gray-700">
                                            {t("first_payment_label")}
                                        </label>
                                        <input
                                            id="date-pay"
                                            type="date"
                                            value={formData.first_payment_date}
                                            onChange={handleDateChange}
                                            className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="edit-price" className="text-sm font-medium text-gray-700">
                                            {t("price_m2_label")}{" "}
                                            <span className="text-[10px] text-gray-400 font-normal">
                                                {buildingUnitPrice}
                                            </span>
                                        </label>
                                        <input
                                            id="edit-price"
                                            type="number"
                                            value={pricePerSqrm}
                                            onChange={(e) => setPricePerSqrm(e.target.value)}
                                            placeholder={
                                                foundApartment
                                                    ? String(foundApartment.final_price)
                                                    : t("select_apartment")
                                            }
                                            className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={calculateMutation.isPending}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl flex items-center disabled:opacity-50 active:scale-95 transition-all"
                                >
                                    {calculateMutation.isPending ? (
                                        t("calculating")
                                    ) : (
                                        <>
                                            {t("calculate_btn")}{" "}
                                            <ChevronRight className="h-5 w-5 ml-2" />
                                        </>
                                    )}
                                </button>
                                <button
                                    type="reset"
                                    onClick={() => {
                                        setSelectedComplexId("");
                                        setSelectedBuildingId("");
                                        setSelectedApartmentId("");
                                        setResult(null);
                                        setPricePerSqrm("");
                                    }}
                                    className="px-6 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
                                >
                                    {t("reset_btn")}
                                </button>
                            </div>
                        </form>
                    </div>

                    {(foundApartment || result) && (
                        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-3 rounded-xl bg-indigo-50">
                                    <BuildingIcon className="text-indigo-500" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900">
                                    {t("apartment_details")}
                                </h2>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1 text-center">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">{t("block_label")}</span>
                                    <div className="p-2 bg-gray-50 border border-gray-100 rounded-xl font-black text-lg">{displayData.block}</div>
                                </div>
                                <div className="space-y-1 text-center">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">{t("floor_label")}</span>
                                    <div className="p-2 bg-gray-50 border border-gray-100 rounded-xl font-black text-lg">{displayData.floor}</div>
                                </div>
                                <div className="space-y-1 text-center">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">{t("area_label")}</span>
                                    <div className="p-2 bg-gray-50 border border-gray-100 rounded-xl font-black text-lg">{displayData.area} м²</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {result && result.payment_dates.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                            <h2 className="text-xl font-black text-gray-900 mb-4">
                                {t("schedule_title")}
                            </h2>
                            <div className="overflow-auto max-h-96 rounded-xl border border-gray-100">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-indigo-50">
                                            <th className="py-2 px-4 text-xs font-bold text-indigo-700 text-center border-b border-indigo-100 w-12">
                                                №
                                            </th>
                                            <th className="py-2 px-4 text-xs font-bold text-indigo-700 text-center border-b border-indigo-100">
                                                {t("payment_date_col")}
                                            </th>
                                            <th className="py-2 px-4 text-xs font-bold text-indigo-700 text-center border-b border-indigo-100">
                                                {t("payment_total_col")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.payment_dates.map((d, i) => (
                                            <tr
                                                key={d}
                                                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                            >
                                                <td className="py-2 px-4 text-xs text-center text-gray-500 font-medium">
                                                    {i + 1}
                                                </td>
                                                <td className="py-2 px-4 text-xs text-center font-medium">
                                                    {new Date(d).toLocaleDateString(locale)}
                                                </td>
                                                <td className="py-2 px-4 text-xs text-center font-bold text-indigo-700">
                                                    {formatCurrency(result.monthly_payment)}{" "}
                                                    <span className="text-[10px] text-gray-400 font-normal">
                                                        {buildingUnitPrice}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-xl">
                        <div className="flex justify-between mb-4">
                            <span className="font-medium opacity-80 uppercase text-xs tracking-wider">
                                {t("monthly_payment")}
                            </span>
                            <CreditCard className="text-white/60" />
                        </div>
                        <div className="text-center mb-6">
                            <p className="text-4xl font-black tracking-tight">
                                {displayData.monthly_payment > 0
                                    ? formatCurrency(displayData.monthly_payment)
                                    : "0"}
                            </p>
                            <p className="text-white/60 text-[10px] uppercase font-bold mt-1">
                                {buildingUnitPrice} / {t("per_month")}
                            </p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl text-center border border-white/10">
                            <p className="text-[10px] uppercase opacity-60 font-bold">
                                {t("payment_day")}
                            </p>
                            <p className="text-2xl font-black">
                                {displayData.payment_dates?.length > 0
                                    ? formatDay(displayData.payment_dates[0])
                                    : "-"}
                                {t("payment_number_suffix")}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-black text-gray-900 uppercase text-sm border-b border-gray-100 pb-2">
                            {t("summary_title")}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t("total_area")}</span>
                                <span className="font-bold">{displayData.area} м²</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t("price_per_sqm")}</span>
                                <span className="font-bold">
                                    {formatCurrency(displayData.new_price_per_sqrm)}{" "}
                                    <span className="text-[10px] text-gray-500">{buildingUnitPrice}</span>
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t("first_investment")}</span>
                                <span className="font-black text-indigo-600">
                                    {investmentType === "percentage"
                                        ? formatCurrency(
                                              displayData.new_total_price *
                                                  (formData.first_investment_rate / 100),
                                          )
                                        : formatCurrency(formData.first_investment_rate)}{" "}
                                    <span className="text-[10px] text-gray-500">{buildingUnitPrice}</span>
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t("installment_period")}</span>
                                <span className="font-bold">{formData.period_count} {t("months")}</span>
                            </div>
                            <div className="flex justify-between text-xl pt-4 border-t font-black text-indigo-600">
                                <span className="uppercase text-sm self-center text-gray-800">
                                    {t("total")}
                                </span>
                                <span>
                                    {formatCurrency(displayData.new_total_price)}{" "}
                                    <span className="text-[10px] text-gray-500">{buildingUnitPrice}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {result && (
                        <>
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl flex items-center disabled:opacity-50 active:scale-95 transition-all"
                            >
                                {t("download_pdf")}
                            </button>
                            <div className="hidden">
                                <ReportTemplate
                                    ref={componentRef}
                                    data={displayData}
                                    apartmentNumber={
                                        foundApartment?.number?.toString() || ""
                                    }
                                    imgUrl={complexLogoUrl ?? undefined}
                                    priceUnit={buildingUnitPrice}
                                    layoutImageUrl={layoutImageUrl}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
