import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldProps {
	label: ReactNode;
	htmlFor?: string;
	required?: boolean;
	hint?: ReactNode;
	error?: ReactNode;
	className?: string;
	children: ReactNode;
}

export function Field({ label, htmlFor, required, hint, error, className, children }: FieldProps) {
	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<label htmlFor={htmlFor} className="text-[13px] font-medium text-slate-700">
				{label}
				{required && <span className="ml-0.5 text-red-500">*</span>}
			</label>
			{children}
			{error ? (
				<p className="text-xs text-red-600">{error}</p>
			) : hint ? (
				<p className="text-xs text-slate-500">{hint}</p>
			) : null}
		</div>
	);
}

export function RangeInputs({ children }: { children: ReactNode }) {
	return <div className="flex items-center gap-1.5 [&>input]:min-w-0">{children}</div>;
}
