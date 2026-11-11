"use client";

import {
	Building,
	DoorOpen,
	Layers3,
	LayoutGrid,
	Percent,
	TrendingUp,
	Wallet,
} from "lucide-react";
import { BackLink } from "@/components/shared/kit/back-link";
import { formatNumber } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { ModalUpdateBuildings } from "../modals/building-modals/modal-update-buildings/_modal-update-building";
import { ModalDeleteBuildings } from "../modals/building-modals/modal-delete-buildings/_modal-delete-buildings";
import { ModalAddedCoefficient } from "../modals/building-modals/modal-add-coefficient/_modal-add-coefficient";
import { LayoutsTab } from "./layouts-tab/_layouts-tab";
import { ApartmentsTab } from "./apartments-tab/_apartments-tab";
import { useRouter } from "next/navigation";
import type { TabsProps } from "@/types/props.types";

export function TabsDemoBuildings({ initialBuilding, allComplexes }: TabsProps) {
	const router = useRouter();
	const t = useTranslations("tabs");
	const tb = useTranslations("building");

	const handleSuccess = () => {
		router.refresh();
	};

	const buildingComplex = allComplexes.find(
		(c) => c.id === initialBuilding.complex_id,
	);

	const stats = [
		{ icon: Layers3, label: tb("floors_stat"), value: initialBuilding.floor_count },
		{ icon: TrendingUp, label: tb("max_coef_stat"), value: initialBuilding.max_coefficient },
		{
			icon: Wallet,
			label: tb("price_m2_stat"),
			value: formatNumber(initialBuilding.base_price),
			unit: initialBuilding.price_unit,
		},
	];

	return (
		<div>
			<BackLink href={buildingComplex ? `/complex/${buildingComplex.id}` : "/"}>
				{buildingComplex ? buildingComplex.name : tb("all_buildings")}
			</BackLink>

			<div className="glass mb-6 rounded-2xl p-5">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex min-w-0 items-center gap-3.5">
						<div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-sm shadow-ink/20">
							<Building size={22} strokeWidth={1.75} />
						</div>
						<div className="min-w-0">
							<p className="eyebrow">{buildingComplex?.name ?? tb("title")}</p>
							<h1 className="mt-0.5 truncate text-2xl font-semibold tracking-tight text-slate-900">
								{initialBuilding.name}
							</h1>
						</div>
					</div>
					<div className="flex shrink-0 items-center gap-1.5">
						<ModalUpdateBuildings building={initialBuilding} onSuccess={handleSuccess} />
						<ModalDeleteBuildings
							buildingId={initialBuilding.id}
							complexId={Number(initialBuilding.complex_id)}
						/>
					</div>
				</div>

				<dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
					{stats.map(({ icon: Icon, label, value, unit }) => (
						<div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3">
							<Icon size={18} className="shrink-0 text-indigo-400" strokeWidth={1.75} />
							<div className="min-w-0">
								<dt className="text-xs text-slate-500">{label}</dt>
								<dd className="truncate text-lg font-semibold tabular-nums text-slate-900">
									{value}
									{unit && <span className="ml-1 text-xs font-medium text-slate-400">{unit}</span>}
								</dd>
							</div>
						</div>
					))}
				</dl>
			</div>

			<Tabs defaultValue="apartments" className="w-full">
				<TabsList>
					<TabsTrigger value="apartments">
						<DoorOpen />
						{t("apartments")}
					</TabsTrigger>
					<TabsTrigger value="layouts">
						<LayoutGrid />
						{t("layouts")}
					</TabsTrigger>
					<TabsTrigger value="coefficients">
						<Percent />
						{t("coefficients")}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="apartments">
					<ApartmentsTab buildingId={Number(initialBuilding.id)} />
				</TabsContent>

				<TabsContent value="layouts">
					<LayoutsTab buildingId={Number(initialBuilding.id)} />
				</TabsContent>

				<TabsContent value="coefficients">
					<ModalAddedCoefficient buildingId={Number(initialBuilding.id)} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
