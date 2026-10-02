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
import { DebouncedInput } from "../debounce-input/_debounce_input";
import type { IComplex } from "@/types/complex.types";

interface FilterProps {
	complexes: IComplex[];
}

const BuildingsFilter: React.FC<FilterProps> = React.memo(({ complexes }) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const t = useTranslations("filter");

	const updateQuery = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString());

			if (value && value !== "all" && value.trim() !== "") {
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
		<div className="space-y-3 mb-6">
			<div className="grid grid-cols-4 gap-3">
				<Select
					value={searchParams.get("complex_id") || "all"}
					onValueChange={(v) => updateQuery("complex_id", v)}
				>
					<SelectTrigger className="h-10 text-xs">
						<SelectValue placeholder={t("all_complexes")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("all_complexes")}</SelectItem>
						{complexes.map((c) => (
							<SelectItem key={c.id} value={String(c.id)}>
								{c.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<DebouncedInput
					placeholder={t("search_buildings")}
					className="h-10 text-xs "
					value={searchParams.get("name__ilike") || ""}
					onChange={(val) => updateQuery("name__ilike", val)}
				/>

				<DebouncedInput
					placeholder={t("exact_floors")}
					type="number"
					className="h-10 text-xs"
					value={searchParams.get("floor_count") || ""}
					onChange={(val) => updateQuery("floor_count", val)}
				/>

				<DebouncedInput
					placeholder={t("floors_from")}
					type="number"
					className="h-10 text-xs"
					value={searchParams.get("floor_count__gte") || ""}
					onChange={(val) => updateQuery("floor_count__gte", val)}
				/>
				<DebouncedInput
					placeholder={t("floors_to")}
					type="number"
					className="h-10 text-xs"
					value={searchParams.get("floor_count__lte") || ""}
					onChange={(val) => updateQuery("floor_count__lte", val)}
				/>
				<DebouncedInput
					placeholder={t("price")}
					type="number"
					className="h-10 text-xs"
					value={searchParams.get("base_price") || ""}
					onChange={(val) => updateQuery("base_price", val)}
				/>
				<DebouncedInput
					placeholder={t("price_from")}
					type="number"
					className="h-10 text-xs"
					value={searchParams.get("base_price__gte") || ""}
					onChange={(val) => updateQuery("base_price__gte", val)}
				/>
				<DebouncedInput
					placeholder={t("price_to")}
					type="number"
					className="h-10 text-xs"
					value={searchParams.get("base_price__lte") || ""}
					onChange={(val) => updateQuery("base_price__lte", val)}
				/>
			</div>
		</div>
	);
});

BuildingsFilter.displayName = "BuildingsFilter";
export default BuildingsFilter;
