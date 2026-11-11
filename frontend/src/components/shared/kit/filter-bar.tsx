"use client";

import type { ReactNode } from "react";
import { ArrowUpDown, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div
			className={cn(
				"glass mb-5 flex flex-wrap items-center gap-2 rounded-2xl p-2",
				className,
			)}
		>
			{children}
		</div>
	);
}

interface InlineRangeProps {
	label: ReactNode;
	min: string;
	max: string;
	onMinChange: (v: string) => void;
	onMaxChange: (v: string) => void;
	inputClassName?: string;
}

export function InlineRange({
	label,
	min,
	max,
	onMinChange,
	onMaxChange,
	inputClassName = "w-[84px]",
}: InlineRangeProps) {
	const tc = useTranslations("common");
	return (
		<div className="flex items-center gap-1.5">
			<span className="whitespace-nowrap pl-1 pr-0.5 text-[13px] text-slate-500">{label}</span>
			<Input
				type="number"
				min={0}
				inputMode="decimal"
				placeholder={tc("from")}
				value={min}
				onChange={(e) => onMinChange(e.target.value)}
				className={inputClassName}
			/>
			<span className="text-slate-300">–</span>
			<Input
				type="number"
				min={0}
				inputMode="decimal"
				placeholder={tc("to")}
				value={max}
				onChange={(e) => onMaxChange(e.target.value)}
				className={inputClassName}
			/>
		</div>
	);
}

interface SortSelectProps {
	value: string;
	onChange: (v: string) => void;
	options: { value: string; label: string }[];
	className?: string;
}

export function SortSelect({ value, onChange, options, className }: SortSelectProps) {
	const tf = useTranslations("filter");
	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger className={cn("w-auto min-w-[170px]", className)} aria-label={tf("sort_label")}>
				<span className="flex items-center gap-2">
					<ArrowUpDown className="size-3.5 text-slate-400" />
					<SelectValue />
				</span>
			</SelectTrigger>
			<SelectContent>
				{options.map((o) => (
					<SelectItem key={o.value} value={o.value}>
						{o.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export function ResetFiltersButton({ onClick }: { onClick: () => void }) {
	const tf = useTranslations("filter");
	return (
		<Button variant="ghost" size="sm" onClick={onClick} className="h-10 text-slate-500">
			<X />
			{tf("reset")}
		</Button>
	);
}
