"use client";

import React, { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { IBuildings } from "@/types/building.types";
import { DebouncedInput } from "../debounce-input/_debounce_input";

interface FilterProps {
	buildings: IBuildings[];
}

export const ApartmentFilters: React.FC<FilterProps> = React.memo(
	({ buildings }) => {
		const router = useRouter();
		const pathname = usePathname();
		const searchParams = useSearchParams();
		const t = useTranslations("filter");
		const ts = useTranslations("status");

		const updateQuery = useCallback(
			(name: string, value: string) => {
				const params = new URLSearchParams(searchParams.toString());

				if (value && value !== "all") {
					params.set(name, value);
				} else {
					params.delete(name);
				}

				params.set("offset", "0");
				router.push(
					(pathname +
						"?" +
						params.toString()) as __next_route_internal_types__.RouteImpl<string>,
					{ scroll: false },
				);
			},
			[pathname, router, searchParams],
		);

		return (
			<div className="grid grid-cols-6 gap-2 mb-4 w-full">
				<Select
					value={searchParams.get("building_id") || "all"}
					onValueChange={(v) => updateQuery("building_id", v)}
				>
					<SelectTrigger className="h-9 text-xs">
						<SelectValue placeholder={t("all_buildings")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("all_buildings")}</SelectItem>
						{buildings.map((b) => (
							<SelectItem key={b.id} value={String(b.id)}>
								{b.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={searchParams.get("status") || "all"}
					onValueChange={(v) => updateQuery("status", v)}
				>
					<SelectTrigger className="h-9 text-xs">
						<SelectValue placeholder={t("all_statuses")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("all_statuses")}</SelectItem>
						<SelectItem value="free">{ts("free")}</SelectItem>
						<SelectItem value="sold">{ts("sold")}</SelectItem>
						<SelectItem value="booked">{ts("booked")}</SelectItem>
						<SelectItem value="withdrawn">{ts("withdrawn")}</SelectItem>
					</SelectContent>
				</Select>

				<DebouncedInput
					placeholder={t("rooms_placeholder")}
					type="number"
					className="h-9 text-xs"
					value={searchParams.get("room_count") || ""}
					onChange={(val) => updateQuery("room_count", val)}
				/>

				<DebouncedInput
					placeholder={t("floor_placeholder")}
					type="number"
					className="h-9 text-xs"
					value={searchParams.get("floor") || ""}
					onChange={(val) => updateQuery("floor", val)}
				/>

				<DebouncedInput
					placeholder={t("area_from")}
					className="h-9 text-xs"
					value={searchParams.get("area__gte") || ""}
					onChange={(val) => updateQuery("area__gte", val)}
				/>

				<DebouncedInput
					placeholder={t("area_to")}
					className="h-9 text-xs"
					value={searchParams.get("area__lte") || ""}
					onChange={(val) => updateQuery("area__lte", val)}
				/>
			</div>
		);
	},
);

ApartmentFilters.displayName = "ApartmentFilters";
