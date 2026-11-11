"use client";

import {
    Calculator as CalculatorIcon,
    CreditCard,
    FileDown,
    Loader2,
    RotateCcw,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { useBuildingApartments } from "@/action/hooks/apartments-hook/get-apartments.hook";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/shared/kit/field";
import { FormSection } from "@/components/shared/kit/form-section";
import { Segmented } from "@/components/shared/kit/segmented";
import { statusStyle } from "@/lib/apartment-status";
import { cn } from "@/lib/cn";

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

function sliderBg(percent: number) {
    return `linear-gradient(to right, #1e2150 0%, #4f46e5 ${percent}%, #e2e8f0 ${percent}%, #e2e8f0 100%)`;
}

function nextMonthDate() {
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 1);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDay(date: string): string {
    if (!date || date.length < 10) return "-";
    const day = date.slice(8, 10);
    return day.startsWith("0") ? day[1] : day;
}

export const CalculatorClientPage: React.FC = () => {
    const componentRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const [selectedComplexId, setSelectedComplexId] = useState(searchParams.get("complex") ?? "");
    const [selectedBuildingId, setSelectedBuildingId] = useState(searchParams.get("building") ?? "");
    const [selectedApartmentId, setSelectedApartmentId] = useState(searchParams.get("apartment") ?? "");
    const [result, setResult] = useState<CalculatePricingResponse | null>(null);
    const [investmentType, setInvestmentType] = useState<InvestmentType>("percentage");
    const [formData, setFormData] = useState<CalculatePricingPayload>({
        first_investment_rate: 15,
        first_payment_date: nextMonthDate(),
        period_count: 12,
    });
    const [customPrice, setPricePerSqrm] = useState<string | null>(null);

    const t = useTranslations("calculator");
    const ts = useTranslations("status");
    const locale = useLocale();

    const { data: complexesData = [] } = useComplexes();
    const { data: buildingsData = [] } = useBuildings(
        selectedComplexId ? { complex_id: Number(selectedComplexId) } : null
    );
    const { data: apartmentsData = [], isLoading: isApartmentsLoading } = useBuildingApartments(
        Number(selectedBuildingId) || 0,
    );
    const { data: layoutsData = [] } = useLayoutsByBuilding(selectedBuildingId || null);

    const complexes = (complexesData || []) as IComplex[];
    const buildings = (buildingsData || []) as IBuildings[];
    const apartments = useMemo(
        () => (selectedBuildingId ? ((apartmentsData || []) as IApartment[]) : []),
        [apartmentsData, selectedBuildingId],
    );

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

    const pricePerSqrm = customPrice ?? (foundApartment ? String(Number(foundApartment.final_price)) : "");

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
        () => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }),
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

    const unit = String(buildingUnitPrice || "");
    const firstInvestment =
        investmentType === "percentage"
            ? displayData.new_total_price * (formData.first_investment_rate / 100)
            : formData.first_investment_rate;
    const style = foundApartment ? statusStyle(foundApartment.status) : null;

    const summaryRows = [
        { label: t("block_label"), value: displayData.block },
        { label: t("floor_label"), value: displayData.floor || "—" },
        { label: t("total_area"), value: `${displayData.area} м²` },
        { label: t("price_per_sqm"), value: `${formatCurrency(displayData.new_price_per_sqrm)} ${unit}` },
        { label: t("first_investment"), value: `${formatCurrency(firstInvestment)} ${unit}`, accent: true },
        { label: t("installment_period"), value: `${formData.period_count} ${t("months")}` },
    ];

    return (
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex min-w-0 flex-col gap-5">
                <form onSubmit={handleSubmit} className="glass flex flex-col gap-6 rounded-2xl p-5 sm:p-6">
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                        {t("payment_settings")}
                    </h2>

                    <FormSection title={t("section_object")}>
                        <Field label={t("complex_label")} required>
                            <Select
                                value={selectedComplexId}
                                onValueChange={(v) => {
                                    setSelectedComplexId(v);
                                    setSelectedBuildingId("");
                                    setSelectedApartmentId("");
                                    setResult(null);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("select_complex")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {complexes.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field
                            label={t("building_label")}
                            required
                            hint={selectedComplexId && buildings.length === 0 ? t("no_buildings") : undefined}
                        >
                            <Select
                                value={selectedBuildingId}
                                disabled={!selectedComplexId}
                                onValueChange={(v) => {
                                    setSelectedBuildingId(v);
                                    setSelectedApartmentId("");
                                    setResult(null);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("select_building")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {buildings.map((b) => (
                                        <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field
                            label={t("apartment_label")}
                            required
                            className="sm:col-span-2"
                            hint={selectedBuildingId && !isApartmentsLoading && apartments.length === 0 ? t("no_apartments") : undefined}
                        >
                            <Select
                                value={selectedApartmentId}
                                disabled={!selectedBuildingId}
                                onValueChange={(v) => {
                                    setSelectedApartmentId(v);
                                    setPricePerSqrm(null);
                                    setResult(null);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("select_apartment")} />
                                </SelectTrigger>
                                <SelectContent className="max-h-80">
                                    {apartments.map((a) => (
                                        <SelectItem key={a.id} value={String(a.id)}>
                                            <span className="flex items-center gap-2">
                                                <span className={cn("size-2 shrink-0 rounded-full", statusStyle(a.status).dot)} />
                                                №{a.number} · {Number(a.area)} м² · {t("floor_label")} {a.floor}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        {foundApartment && style && (
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3 text-[13px] sm:col-span-2">
                                <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", style.chip)}>
                                    <span className={cn("size-1.5 rounded-full", style.dot)} />
                                    {ts(foundApartment.status as TApartmentStatus)}
                                </span>
                                <span className="text-slate-500">{t("floor_label")} <b className="font-semibold text-slate-800">{foundApartment.floor}</b></span>
                                <span className="text-slate-500">{t("area_label")} <b className="font-semibold text-slate-800">{Number(foundApartment.area)} м²</b></span>
                                <span className="text-slate-500">{t("price_m2_label")} <b className="font-semibold tabular-nums text-slate-800">{formatCurrency(Number(foundApartment.final_price))} {unit}</b></span>
                            </div>
                        )}
                    </FormSection>

                    <FormSection title={t("section_payment")}>
                        <Field label={t("investment_type_label")}>
                            <Segmented
                                className="w-full [&>button]:flex-1"
                                value={investmentType}
                                onChange={(v) => {
                                    setInvestmentType(v);
                                    setFormData((prev) => ({ ...prev, first_investment_rate: 0 }));
                                }}
                                options={[
                                    { value: "percentage", label: t("percentage_option") },
                                    { value: "amount", label: t("amount_option", { unit }) },
                                ]}
                            />
                        </Field>
                        <Field label={investmentType === "percentage" ? t("rate_label") : t("amount_label")} htmlFor="unit-price">
                            <div className="relative">
                                <Input
                                    id="unit-price"
                                    type="number"
                                    value={formData.first_investment_rate || ""}
                                    onChange={handleInvestmentRateChange}
                                    className="pr-14 font-semibold tabular-nums"
                                    placeholder="0"
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                                    {investmentType === "percentage" ? "%" : unit}
                                </span>
                            </div>
                        </Field>
                        {investmentType === "percentage" && (
                            <div className="sm:col-span-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={formData.first_investment_rate}
                                    onChange={handleInvestmentRateChange}
                                    className="range-slider w-full"
                                    style={{ background: sliderBg(formData.first_investment_rate) }}
                                    aria-label={t("rate_label")}
                                />
                                <div className="mt-1.5 flex justify-between text-[11px] font-medium tabular-nums text-slate-400">
                                    {[0, 25, 50, 75, 100].map((v) => <span key={v}>{v}%</span>)}
                                </div>
                            </div>
                        )}
                    </FormSection>

                    <FormSection title={t("section_terms")}>
                        <div className="sm:col-span-2">
                            <div className="mb-2 flex items-center justify-between text-[13px]">
                                <span className="font-medium text-slate-700">{t("period_label")}</span>
                                <span className="rounded-md bg-slate-900/[0.05] px-2 py-0.5 font-semibold tabular-nums text-ink">
                                    {formData.period_count} {t("months")}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="60"
                                value={formData.period_count}
                                onChange={handlePeriodChange}
                                className="range-slider w-full"
                                style={{ background: sliderBg(sliderPercentage) }}
                                aria-label={t("period_label")}
                            />
                            <div className="mt-1.5 flex justify-between text-[11px] font-medium tabular-nums text-slate-400">
                                {[1, 12, 24, 36, 48, 60].map((v) => <span key={v}>{v}</span>)}
                            </div>
                        </div>
                        <Field label={t("first_payment_label")} htmlFor="date-pay">
                            <Input
                                id="date-pay"
                                type="date"
                                value={formData.first_payment_date}
                                onChange={handleDateChange}
                            />
                        </Field>
                        <Field label={<>{t("price_m2_label")} <span className="font-normal text-slate-400">{unit}</span></>} htmlFor="edit-price">
                            <Input
                                id="edit-price"
                                type="number"
                                value={pricePerSqrm}
                                onChange={(e) => setPricePerSqrm(e.target.value)}
                                placeholder={foundApartment ? String(Number(foundApartment.final_price)) : t("select_apartment")}
                                className="font-semibold tabular-nums"
                            />
                        </Field>
                    </FormSection>

                    <div className="flex flex-wrap gap-2 border-t border-slate-200/70 pt-5">
                        <Button type="submit" size="lg" disabled={calculateMutation.isPending || !selectedApartmentId}>
                            {calculateMutation.isPending ? <Loader2 className="animate-spin" /> : <CalculatorIcon />}
                            {calculateMutation.isPending ? t("calculating") : t("calculate_btn")}
                        </Button>
                        <Button
                            type="button"
                            size="lg"
                            variant="ghost"
                            onClick={() => {
                                setSelectedComplexId("");
                                setSelectedBuildingId("");
                                setSelectedApartmentId("");
                                setResult(null);
                                setPricePerSqrm(null);
                            }}
                        >
                            <RotateCcw />
                            {t("reset_btn")}
                        </Button>
                    </div>
                </form>

                {result && result.payment_dates.length > 0 && (
                    <div className="surface overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <h2 className="text-base font-semibold text-slate-900">{t("schedule_title")}</h2>
                            <span className="text-xs text-slate-500">
                                {result.payment_dates.length} {t("months")}
                            </span>
                        </div>
                        <div className="max-h-[420px] overflow-auto scrollbar-thin">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                                    <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        <th className="h-9 w-14 px-5 text-left">№</th>
                                        <th className="h-9 px-5 text-left">{t("payment_date_col")}</th>
                                        <th className="h-9 px-5 text-right">{t("payment_total_col")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {result.payment_dates.map((d, i) => (
                                        <tr key={d} className="transition-colors hover:bg-slate-50/70">
                                            <td className="px-5 py-2.5 text-xs tabular-nums text-slate-400">{i + 1}</td>
                                            <td className="px-5 py-2.5 tabular-nums text-slate-700">
                                                {new Date(d).toLocaleDateString(locale)}
                                            </td>
                                            <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-slate-900">
                                                {formatCurrency(result.monthly_payment)}
                                                <span className="ml-1 text-[11px] font-normal text-slate-400">{unit}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <aside className="flex flex-col gap-4 xl:sticky xl:top-24">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-ink-soft to-[#3b3f8f] p-6 text-white shadow-xl shadow-ink/25">
                    <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-indigo-400/20 blur-2xl" />
                    <div className="relative flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-white/60">
                            {t("monthly_payment")}
                        </span>
                        <CreditCard className="size-5 text-white/50" />
                    </div>
                    <p className="relative mt-4 text-4xl font-semibold tracking-tight tabular-nums">
                        {displayData.monthly_payment > 0 ? formatCurrency(displayData.monthly_payment) : "0"}
                    </p>
                    <p className="relative mt-1 text-xs text-white/60">
                        {unit} / {t("per_month")}
                    </p>
                    <div className="relative mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                        <span className="text-xs text-white/70">{t("payment_day")}</span>
                        <span className="text-lg font-semibold tabular-nums">
                            {displayData.payment_dates?.length > 0 ? formatDay(displayData.payment_dates[0]) : "—"}
                            {displayData.payment_dates?.length > 0 && t("payment_number_suffix")}
                        </span>
                    </div>
                </div>

                <div className="glass rounded-2xl p-5">
                    <h3 className="eyebrow mb-3">{t("summary_title")}</h3>
                    {!result && (
                        <p className="mb-3 rounded-lg bg-slate-900/[0.03] px-3 py-2 text-xs leading-relaxed text-slate-500">
                            {t("result_hint")}
                        </p>
                    )}
                    <dl className="flex flex-col gap-2.5 text-sm">
                        {summaryRows.map((r) => (
                            <div key={r.label} className="flex items-center justify-between gap-3">
                                <dt className="text-slate-500">{r.label}</dt>
                                <dd className={cn("text-right font-medium tabular-nums", r.accent ? "text-ink" : "text-slate-900")}>
                                    {r.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-200/70 pt-4">
                        <span className="text-sm font-medium text-slate-700">{t("total")}</span>
                        <span className="text-xl font-semibold tabular-nums text-slate-900">
                            {formatCurrency(displayData.new_total_price)}
                            <span className="ml-1 text-xs font-medium text-slate-400">{unit}</span>
                        </span>
                    </div>
                </div>

                {result && (
                    <>
                        <Button type="button" size="lg" variant="outline" onClick={handlePrint} className="w-full">
                            <FileDown />
                            {t("download_pdf")}
                        </Button>
                        <div className="hidden">
                            <ReportTemplate
                                ref={componentRef}
                                data={displayData}
                                apartmentNumber={foundApartment?.number?.toString() || ""}
                                imgUrl={complexLogoUrl ?? undefined}
                                priceUnit={buildingUnitPrice}
                                layoutImageUrl={layoutImageUrl}
                            />
                        </div>
                    </>
                )}
            </aside>
        </div>
    );
};
