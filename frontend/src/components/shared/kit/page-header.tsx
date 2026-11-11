import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
	title: ReactNode;
	description?: ReactNode;
	eyebrow?: ReactNode;
	actions?: ReactNode;
	className?: string;
	as?: "h1" | "h2";
}

export function PageHeader({
	title,
	description,
	eyebrow,
	actions,
	className,
	as: Heading = "h1",
}: PageHeaderProps) {
	return (
		<div
			className={cn(
				"mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				className,
			)}
		>
			<div className="min-w-0">
				{eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
				<Heading
					className={cn(
						"truncate font-semibold tracking-tight text-slate-900",
						Heading === "h1" ? "text-2xl" : "text-lg",
					)}
				>
					{title}
				</Heading>
				{description && (
					<p className="mt-1 text-sm text-slate-500">{description}</p>
				)}
			</div>
			{actions && (
				<div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
			)}
		</div>
	);
}
