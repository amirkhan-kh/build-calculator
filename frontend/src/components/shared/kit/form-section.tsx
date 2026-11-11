import type { ReactNode } from "react";

interface FormSectionProps {
	title: ReactNode;
	hint?: ReactNode;
	children: ReactNode;
}

export function FormSection({ title, hint, children }: FormSectionProps) {
	return (
		<fieldset className="flex flex-col gap-3">
			<legend className="mb-3 flex w-full items-center gap-3">
				<span className="eyebrow whitespace-nowrap">{title}</span>
				<span className="h-px flex-1 bg-slate-200/80" />
			</legend>
			{hint && <p className="-mt-1 text-xs text-slate-500">{hint}</p>}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
		</fieldset>
	);
}
