import Image from "next/image";
import { CalendarClock, LayoutGrid, Percent } from "lucide-react";
import { getTranslations } from "next-intl/server";
import LogoImage from "@/building-icon-removebg-preview.png";
import { LoginForm } from "@/components/shared/auth-forms/login-forms";
import { LanguageSwitcher } from "@/components/shared/language-switcher/_language-switcher";

export default async function LoginPage() {
	const [t, tn] = await Promise.all([getTranslations("auth"), getTranslations("nav")]);

	const features = [
		{ icon: LayoutGrid, text: t("feature_1") },
		{ icon: Percent, text: t("feature_2") },
		{ icon: CalendarClock, text: t("feature_3") },
	];

	return (
		<div className="flex min-h-dvh items-center justify-center p-3 sm:p-6">
			<div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white/60 shadow-2xl shadow-ink/10 backdrop-blur-xl lg:grid-cols-[1.05fr_1fr]">
				<div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-ink via-ink-soft to-[#3b3f8f] p-10 text-white lg:flex">
					<div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-indigo-400/20 blur-3xl" />
					<div className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-indigo-300/10 blur-3xl" />
					<div
						className="pointer-events-none absolute inset-0 opacity-[0.07]"
						style={{
							backgroundImage:
								"linear-gradient(rgb(255 255 255) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255) 1px, transparent 1px)",
							backgroundSize: "36px 36px",
						}}
					/>

					<div className="relative flex items-center gap-3">
						<div className="grid size-10 place-items-center rounded-xl bg-white shadow-sm">
							<Image src={LogoImage} alt="" className="size-8 object-contain" priority />
						</div>
						<div className="leading-tight">
							<p className="text-base font-semibold tracking-tight">{tn("app_name")}</p>
							<p className="text-xs text-white/60">{tn("tagline")}</p>
						</div>
					</div>

					<div className="relative">
						<h2 className="max-w-sm text-3xl font-semibold leading-tight tracking-tight">{t("hero_title")}</h2>
						<p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">{t("hero_text")}</p>
						<ul className="mt-8 flex flex-col gap-3">
							{features.map(({ icon: Icon, text }) => (
								<li key={text} className="flex items-center gap-3 text-sm text-white/85">
									<span className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/10">
										<Icon size={15} />
									</span>
									{text}
								</li>
							))}
						</ul>
					</div>

					<p className="relative text-xs text-white/40">© {new Date().getFullYear()} {tn("app_name")}</p>
				</div>

				<div className="flex flex-col p-6 sm:p-10">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-2.5 lg:invisible">
							<div className="grid size-9 place-items-center rounded-xl bg-ink">
								<Image src={LogoImage} alt="" className="size-7 object-contain brightness-0 invert" />
							</div>
							<span className="text-[15px] font-semibold text-slate-900">{tn("app_name")}</span>
						</div>
						<LanguageSwitcher />
					</div>

					<div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
						<h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t("welcome")}</h1>
						<p className="mt-1.5 text-sm text-slate-500">{t("subtitle")}</p>
						<LoginForm />
					</div>
				</div>
			</div>
		</div>
	);
}
