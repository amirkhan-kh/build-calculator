"use client";
import React, { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { DebouncedInput } from "../debounce-input/_debounce_input";

interface ComplexFiltersProps {
	placeholder?: string;
	queryKey?: string;
}

const ComplexFilters: React.FC<ComplexFiltersProps> = ({
	placeholder,
	queryKey = "name__ilike",
}) => {
	const t = useTranslations("filter");
	const resolvedPlaceholder = placeholder ?? t("search_complexes");
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();

	const updateQuery = useCallback(
		(value: string) => {
			const params = new URLSearchParams(searchParams.toString());

			if (value.trim()) {
				params.set(queryKey, value);
			} else {
				params.delete(queryKey);
			}

			params.set("page", "1");

			router.push(
				`${pathname}?${params.toString()}` as __next_route_internal_types__.RouteImpl<string>,
				{ scroll: false },
			);
		},
		[pathname, router, searchParams, queryKey],
	);

	return (
		<div className="relative w-full max-w-sm">
			<DebouncedInput
				placeholder={resolvedPlaceholder}
				value={searchParams.get(queryKey) || ""}
				onChange={updateQuery}
				className="pl-10 h-10 text-[13px] bg-white border-gray-300 focus:ring-indigo-500 rounded-sm"
			/>
		</div>
	);
};

export default ComplexFilters;
