"use client";

import { cn } from "@/lib/cn";

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}

export function Switch({ checked, onCheckedChange, className, disabled, ...props }: SwitchProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			disabled={disabled}
			onClick={() => onCheckedChange(!checked)}
			className={cn(
				"relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50",
				checked ? "bg-emerald-500" : "bg-slate-300",
				className,
			)}
			{...props}
		>
			<span
				className={cn(
					"pointer-events-none block size-4 rounded-full bg-white shadow-sm transition-transform",
					checked ? "translate-x-[18px]" : "translate-x-0.5",
				)}
			/>
		</button>
	);
}
