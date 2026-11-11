"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/action/locale/set-locale.action";
import { cn } from "@/lib/cn";

const LOCALES = [
	{ code: "ru" as const, label: "RU" },
	{ code: "uz" as const, label: "UZ" },
	{ code: "en" as const, label: "EN" },
];

export function LanguageSwitcher() {
	const locale = useLocale();
	const [isPending, startTransition] = useTransition();

	const handleChange = (code: "ru" | "uz" | "en") => {
		if (code === locale) return;
		startTransition(() => {
			setLocale(code);
		});
	};

	return (
		<div className="flex items-center rounded-lg bg-slate-900/[0.05] p-0.5">
			{LOCALES.map((l) => (
				<button
					key={l.code}
					type="button"
					disabled={isPending}
					onClick={() => handleChange(l.code)}
					className={cn(
						"h-7 rounded-md px-2.5 text-[11px] font-semibold tracking-wide transition-all disabled:opacity-50",
						locale === l.code
							? "bg-white text-ink shadow-xs"
							: "text-slate-500 hover:text-slate-900",
					)}
				>
					{l.label}
				</button>
			))}
		</div>
	);
}
