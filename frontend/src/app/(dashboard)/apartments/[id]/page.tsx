import Link from "next/link";
import { Calculator, DoorOpen, Layers3, Percent, Ruler, SearchX, Wallet } from "lucide-react";
import { ModalDeleteApartments } from "@/components/shared/ui-demo/modals/apartments-modals/modal-delete-apartments/_modal-delete-apartment";
import { ModalUpdateApartments } from "@/components/shared/ui-demo/modals/apartments-modals/modal-update-apartments/_modal-update-apartment";
import { ModalaUpdateCoefficientTypeApartment } from "@/components/shared/ui-demo/modals/apartments-modals/modal-update-coefficient-type-apartment/_modala-update-coefficient-type-apartment";
import { StatusUpdateCell } from "@/components/shared/ui-demo/patch-status/_status-pach";
import { EmptyState } from "@/components/shared/kit/empty-state";
import { BackLink } from "@/components/shared/kit/back-link";
import { getApartmentById } from "@/action/apartaments/get-apartament.api";
import { getBuildingById } from "@/action/buildings/get-building.api";
import { getCoefficientTypesByBuildingId } from "@/action/coefficient-types/get-coefficient-type.api";
import { getAuthData } from "@/lib/auth.util";
import { formatNumber } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Props } from "@/types/props.types";

export default async function SingleApartmentsPage({ params }: Props) {
	const { access } = await getAuthData();
	if (!access) redirect("/login");
	const { id } = await params;
	if (!id) redirect("/");

	const [t, tc, tf, apartment] = await Promise.all([
		getTranslations("apartment"),
		getTranslations("common"),
		getTranslations("filter"),
		getApartmentById(Number(id)),
	]);

	if (!apartment || !apartment.data) {
		return (
			<EmptyState
				className="mt-10"
				icon={SearchX}
				title={t("not_found_page")}
				action={
					<Link href="/" className="text-sm font-medium text-ink hover:underline">
						{tc("back_to_list")}
					</Link>
				}
			/>
		);
	}

	const apartmentData = apartment.data;
	const buildingId = Number(apartmentData.building_id);

	const [allCoefficientTypes, buildingSafe] = await Promise.all([
		getCoefficientTypesByBuildingId(buildingId),
		getBuildingById(buildingId),
	]);
	const building = buildingSafe.data;

	const apartmentCoefficients = allCoefficientTypes
		.flatMap((group) => group.bcts || [])
		.filter((bct) => (apartmentData.bct_ids ?? []).includes(bct.id));

	const specs = [
		{ icon: Layers3, label: tf("floor_label"), value: apartmentData.floor, sub: building ? `/ ${building.floor_count}` : undefined },
		{ icon: DoorOpen, label: tf("rooms_label"), value: apartmentData.room_count },
		{ icon: Ruler, label: tf("area_label"), value: formatNumber(apartmentData.area) },
		{ icon: Wallet, label: t("price_per_sqm_short"), value: formatNumber(apartmentData.final_price), sub: apartmentData.price_unit },
	];

	const calcHref = `/calculator-system?complex=${building?.complex_id ?? ""}&building=${buildingId}&apartment=${apartmentData.id}`;

	return (
		<div>
			<BackLink href={`/buildings/${buildingId}`}>
				{building?.name ?? t("back_to_building")}
			</BackLink>

			<div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
				<div className="flex min-w-0 flex-col gap-5">
					<div className="glass rounded-2xl p-5">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
							<div className="min-w-0">
								<p className="eyebrow">{building?.name ?? t("title")}</p>
								<div className="mt-0.5 flex flex-wrap items-center gap-3">
									<h1 className="text-2xl font-semibold tracking-tight text-slate-900">
										{t("apartment_number_label")} {apartmentData.number}
									</h1>
									<StatusUpdateCell apartment={apartmentData} />
								</div>
							</div>
							<div className="flex shrink-0 items-center gap-1.5">
								<ModalUpdateApartments apartment={apartmentData} />
								<ModalDeleteApartments apartmentId={Number(apartmentData.id)} buildingId={buildingId} />
							</div>
						</div>

						<dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
							{specs.map(({ icon: Icon, label, value, sub }) => (
								<div key={label} className="rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3">
									<dt className="flex items-center gap-1.5 text-xs text-slate-500">
										<Icon size={14} className="text-indigo-400" />
										{label}
									</dt>
									<dd className="mt-1 truncate text-lg font-semibold tabular-nums text-slate-900">
										{value}
										{sub && <span className="ml-1 text-xs font-medium text-slate-400">{sub}</span>}
									</dd>
								</div>
							))}
						</dl>
					</div>

					<section className="surface overflow-hidden">
						<div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
							<h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
								<Percent size={16} className="text-indigo-400" />
								{t("active_coefficients")}
							</h2>
							{apartmentCoefficients.length > 0 && (
								<span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
									{t("applied_count", { count: apartmentCoefficients.length })}
								</span>
							)}
						</div>
						{apartmentCoefficients.length === 0 ? (
							<p className="px-5 py-8 text-center text-sm text-slate-400">{t("no_coefficients")}</p>
						) : (
							<ul className="divide-y divide-slate-100">
								{apartmentCoefficients.map((bct) => (
									<li key={bct.id} className="flex items-center gap-3 px-5 py-3">
										<span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{bct.name}</span>
										<span className="text-sm font-semibold tabular-nums text-slate-900">{bct.rate}%</span>
										<ModalaUpdateCoefficientTypeApartment
											coefficientType={bct}
											buildingId={buildingId}
											coefficientId={bct.coefficient_id}
										/>
									</li>
								))}
							</ul>
						)}
					</section>
				</div>

				<aside className="flex flex-col gap-4 xl:sticky xl:top-24">
					<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-ink-soft to-[#3b3f8f] p-6 text-white shadow-xl shadow-ink/25">
						<div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-indigo-400/20 blur-2xl" />
						<p className="relative text-xs font-medium uppercase tracking-wider text-white/60">{t("price_total")}</p>
						<p className="relative mt-3 text-3xl font-semibold tracking-tight tabular-nums">
							{formatNumber(apartmentData.total_price)}
						</p>
						<p className="relative mt-1 text-xs text-white/60">{apartmentData.price_unit}</p>
						<div className="relative mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm backdrop-blur-sm">
							<span className="text-white/70">{t("price_per_sqm_short")}</span>
							<span className="font-semibold tabular-nums">
								{formatNumber(apartmentData.final_price)} {apartmentData.price_unit}
							</span>
						</div>
					</div>
					<Link
						href={calcHref as `/calculator-system`}
						className={buttonVariants({ size: "lg", className: "w-full" })}
					>
						<Calculator />
						{t("calculate_cta")}
					</Link>
				</aside>
			</div>
		</div>
	);
}
