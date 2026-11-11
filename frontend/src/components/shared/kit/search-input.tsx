"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { DebouncedInput } from "@/components/shared/ui-demo/debounce-input/_debounce_input";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	debounce?: number;
	className?: string;
}

export function SearchInput({
	value,
	onChange,
	placeholder,
	debounce,
	className,
}: SearchInputProps) {
	const inputClass = "pl-9 pr-9";
	return (
		<div className={cn("relative min-w-0", className)}>
			<Search
				size={16}
				className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
			/>
			{debounce === undefined ? (
				<Input
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					className={inputClass}
				/>
			) : (
				<DebouncedInput
					value={value}
					onChange={onChange}
					debounce={debounce}
					placeholder={placeholder}
					className={inputClass}
				/>
			)}
			{value && (
				<button
					type="button"
					onClick={() => onChange("")}
					className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
					aria-label="Clear"
				>
					<X size={14} />
				</button>
			)}
		</div>
	);
}
