"use client";

import { cn } from "@/lib/cn";

interface SegmentedOption<T extends string> {
	value: T;
	label: React.ReactNode;
}

interface SegmentedProps<T extends string> {
	value: T;
	onChange: (value: T) => void;
	options: SegmentedOption<T>[];
	className?: string;
}

export function Segmented<T extends string>({
	value,
	onChange,
	options,
	className,
}: SegmentedProps<T>) {
	return (
		<div
			role="radiogroup"
			className={cn(
				"inline-flex h-10 items-center gap-0.5 rounded-lg bg-slate-900/[0.05] p-1",
				className,
			)}
		>
			{options.map((o) => {
				const active = o.value === value;
				return (
					<button
						key={o.value}
						type="button"
						role="radio"
						aria-checked={active}
						onClick={() => onChange(o.value)}
						className={cn(
							"h-8 whitespace-nowrap rounded-md px-3 text-[13px] font-medium transition-all",
							active
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-500 hover:text-slate-900",
						)}
					>
						{o.label}
					</button>
				);
			})}
		</div>
	);
}
