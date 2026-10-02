"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/action/locale/set-locale.action";

const LOCALES = [
	{ code: "ru" as const, label: "RU" },
	{ code: "uz" as const, label: "UZ" },
	{ code: "en" as const, label: "EN" },
];

export function LanguageSwitcher() {
	const locale = useLocale();
	const [isPending, startTransition] = useTransition();

	const handleChange = (code: "ru" | "uz" | "en") => {
		startTransition(() => {
			setLocale(code);
		});
	};

	return (
		<div className="flex items-center gap-0.5">
			{LOCALES.map((l) => (
				<button
					key={l.code}
					type="button"
					disabled={isPending}
					onClick={() => handleChange(l.code)}
					className={`px-2 py-0.5 rounded text-xs font-bold transition-colors disabled:opacity-50 ${
						locale === l.code
							? "bg-[#282964] text-white"
							: "text-gray-500 hover:text-[#282964] hover:bg-gray-100"
					}`}
				>
					{l.label}
				</button>
			))}
		</div>
	);
}
