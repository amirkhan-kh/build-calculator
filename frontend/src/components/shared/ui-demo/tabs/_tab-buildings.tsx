"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { ModalUpdateBuildings } from "../modals/building-modals/modal-update-buildings/_modal-update-building";
import { ModalDeleteBuildings } from "../modals/building-modals/modal-delete-buildings/_modal-delete-buildings";
import { ModalAddedCoefficient } from "../modals/building-modals/modal-add-coefficient/_modal-add-coefficient";
import { LayoutsTab } from "./layouts-tab/_layouts-tab";
import { ApartmentsTab } from "./apartments-tab/_apartments-tab";
import { FaRegBuilding } from "react-icons/fa";
import { MdOutlineBarChart } from "react-icons/md";
import { GrMoney } from "react-icons/gr";
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

	return (
		<div>
			<Link
				href={buildingComplex ? `/complex/${buildingComplex.id}` : "/"}
				className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-indigo-600 transition-colors mb-4"
			>
				<ArrowLeft size={16} />
				{buildingComplex ? buildingComplex.name : tb("all_buildings")}
			</Link>

			<div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
				<div>
					<span className="text-[10px] font-bold uppercase tracking-wide text-indigo-400">
						{buildingComplex?.name ?? tb("title")}
					</span>
					<h1 className="text-2xl font-black text-gray-900 capitalize mt-0.5">
						{initialBuilding.name}
					</h1>
				</div>
				<div className="flex gap-2 shrink-0">
					<ModalUpdateBuildings
						building={initialBuilding}
						onSuccess={handleSuccess}
					/>
					<ModalDeleteBuildings
						buildingId={initialBuilding.id}
						complexId={Number(initialBuilding.complex_id)}
					/>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-4 mb-6">
				<div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex items-center gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
						<FaRegBuilding className="text-indigo-500" size={18} />
					</div>
					<div>
						<p className="text-[10px] font-bold uppercase text-gray-400">{tb("floors_stat")}</p>
						<p className="text-2xl font-black text-gray-900">{initialBuilding.floor_count}</p>
					</div>
				</div>

				<div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex items-center gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
						<MdOutlineBarChart className="text-indigo-500" size={18} />
					</div>
					<div>
						<p className="text-[10px] font-bold uppercase text-gray-400">{tb("max_coef_stat")}</p>
						<p className="text-2xl font-black text-gray-900">{initialBuilding.max_coefficient}</p>
					</div>
				</div>

				<div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex items-center gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
						<GrMoney className="text-indigo-500" size={16} />
					</div>
					<div className="min-w-0">
						<p className="text-[10px] font-bold uppercase text-gray-400">{tb("price_m2_stat")}</p>
						<p className="text-lg font-black text-gray-900 truncate">
							{Number(initialBuilding.base_price).toLocaleString()}{" "}
							<span className="text-xs font-medium text-gray-400">{initialBuilding.price_unit}</span>
						</p>
					</div>
				</div>
			</div>

			<Tabs defaultValue="apartments" className="w-full">
				<TabsList className="mb-4">
					<TabsTrigger value="apartments">{t("apartments")}</TabsTrigger>
					<TabsTrigger value="layouts">{t("layouts")}</TabsTrigger>
					<TabsTrigger value="coefficients">{t("coefficients")}</TabsTrigger>
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
