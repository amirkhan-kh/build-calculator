import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

export function BackLink<T extends string>({ href, children }: { href: Route<T>; children: ReactNode }) {
	return (
		<Link
			href={href}
			className="group mb-4 inline-flex items-center gap-1.5 rounded-lg py-1 text-[13px] font-medium text-slate-500 transition-colors hover:text-ink"
		>
			<ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
			{children}
		</Link>
	);
}
