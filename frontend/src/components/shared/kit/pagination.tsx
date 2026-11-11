"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface PaginationProps {
	page: number;
	totalPages: number;
	onChange: (page: number) => void;
	maxVisible?: number;
}

export function Pagination({ page, totalPages, onChange, maxVisible = 5 }: PaginationProps) {
	const pages = useMemo(() => {
		let start = Math.max(1, page - Math.floor(maxVisible / 2));
		let end = start + maxVisible - 1;
		if (end > totalPages) {
			end = totalPages;
			start = Math.max(1, end - maxVisible + 1);
		}
		return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
	}, [page, totalPages, maxVisible]);

	if (totalPages <= 1) return null;

	const navBtn =
		"grid size-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30";

	return (
		<nav className="flex items-center gap-1">
			<button
				type="button"
				disabled={page <= 1}
				onClick={() => onChange(page - 1)}
				className={navBtn}
				aria-label="Previous"
			>
				<ChevronLeft size={16} />
			</button>
			{pages.map((p) => (
				<button
					key={p}
					type="button"
					onClick={() => onChange(p)}
					aria-current={p === page ? "page" : undefined}
					className={cn(
						"h-8 min-w-8 rounded-lg px-2 text-[13px] font-medium tabular-nums transition-colors",
						p === page
							? "bg-primary text-white shadow-sm"
							: "text-slate-600 hover:bg-white hover:text-slate-900",
					)}
				>
					{p}
				</button>
			))}
			<button
				type="button"
				disabled={page >= totalPages}
				onClick={() => onChange(page + 1)}
				className={navBtn}
				aria-label="Next"
			>
				<ChevronRight size={16} />
			</button>
		</nav>
	);
}
