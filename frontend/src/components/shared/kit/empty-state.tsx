import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
	title: ReactNode;
	description?: ReactNode;
	icon?: LucideIcon;
	action?: ReactNode;
	className?: string;
}

export function EmptyState({
	title,
	description,
	icon: Icon = Inbox,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 px-6 py-14 text-center",
				className,
			)}
		>
			<div className="mb-3 grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-400">
				<Icon size={22} strokeWidth={1.75} />
			</div>
			<p className="text-sm font-medium text-slate-700">{title}</p>
			{description && (
				<p className="mt-1 max-w-sm text-[13px] text-slate-500">{description}</p>
			)}
			{action && <div className="mt-4">{action}</div>}
		</div>
	);
}

export function LoadingState({ className }: { className?: string }) {
	return (
		<div className={cn("flex min-h-64 items-center justify-center", className)}>
			<span className="size-6 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500" />
		</div>
	);
}
