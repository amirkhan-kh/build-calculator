"use client";

import React, { memo, useCallback, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { isNavActive, navigation, platformNavigation } from "../shared/nav-link";
import { logoutAction } from "@/action/auth/logout.action";
import { clearAuthCache } from "@/lib/auth.util";
import { useAuthMe } from "@/action/hooks/login-hook/use-auth-me";
import { cn } from "@/lib/cn";
import LogoImage from "@/building-icon-removebg-preview.png";

interface IasideProps {
	collapsed: boolean;
	mobileOpen: boolean;
	onClose: () => void;
}

function initials(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

const Aside: React.FC<IasideProps> = ({ collapsed, mobileOpen, onClose }) => {
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();
	const t = useTranslations("nav");
	const { data: me } = useAuthMe();
	const user = me?.data;
	const isPlatformAdmin = !!user?.is_platform_admin;
	const navItems = isPlatformAdmin ? platformNavigation : navigation;
	const displayName = user?.fullname || user?.username || "";

	const handleLogout = useCallback(() => {
		startTransition(async () => {
			clearAuthCache();
			await logoutAction();
		});
	}, []);

	const hideWhenCollapsed = collapsed ? "lg:hidden" : "";

	return (
		<>
			<div
				aria-hidden
				onClick={onClose}
				className={cn(
					"fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
					mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
				)}
			/>
			<aside
				className={cn(
					"glass-ink fixed inset-y-3 left-3 z-40 flex w-64 flex-col overflow-hidden rounded-2xl text-slate-300 shadow-2xl shadow-ink/25 transition-[width,transform] duration-300 ease-out",
					collapsed ? "lg:w-16" : "lg:w-60",
					mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)] lg:translate-x-0",
				)}
			>
				<div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.07] px-3.5">
					<div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white shadow-sm">
						<Image src={LogoImage} alt="" className="size-7 object-contain" priority />
					</div>
					<div className={cn("min-w-0 leading-tight", hideWhenCollapsed)}>
						<p className="truncate text-[15px] font-semibold tracking-tight text-white">
							{t("app_name")}
						</p>
						<p className="truncate text-[11px] text-slate-400">{t("tagline")}</p>
					</div>
				</div>

				<nav className="flex-1 overflow-y-auto px-2.5 py-4 scrollbar-thin">
					<ul className="space-y-1">
						{navItems.map((item) => {
							const Icon = item.icon;
							const active = isNavActive(item.pathName, pathname);
							const label = t(item.navKey);

							return (
								<li key={item.navKey}>
									<Link
										href={item.pathName}
										title={collapsed ? label : undefined}
										className={cn(
											"group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
											active
												? "bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]"
												: "text-slate-400 hover:bg-white/[0.06] hover:text-white",
											collapsed && "lg:justify-center lg:px-0",
										)}
									>
										{active && (
											<span className="absolute inset-y-2.5 left-0 w-[3px] rounded-r-full bg-indigo-300" />
										)}
										<Icon
											size={17}
											strokeWidth={active ? 2.2 : 1.8}
											className="shrink-0"
										/>
										<span className={cn("truncate", hideWhenCollapsed)}>{label}</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>

				<div className="shrink-0 border-t border-white/[0.07] p-2.5">
					<div
						className={cn(
							"flex items-center gap-2.5 rounded-xl px-1.5 py-1.5",
							collapsed && "lg:flex-col lg:px-0",
						)}
					>
						<div
							title={collapsed ? displayName : undefined}
							className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-[11px] font-semibold text-white ring-2 ring-white/10"
						>
							{initials(displayName)}
						</div>
						<div className={cn("min-w-0 flex-1 leading-tight", hideWhenCollapsed)}>
							<p className="truncate text-[13px] font-medium text-white">
								{displayName || "—"}
							</p>
							<p className="truncate text-[11px] text-slate-400">
								{isPlatformAdmin ? t("platform_admin") : user?.username ? `@${user.username}` : ""}
							</p>
						</div>
						<button
							type="button"
							onClick={handleLogout}
							disabled={isPending}
							title={t("logout")}
							aria-label={t("logout")}
							className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
						>
							<LogOut size={16} />
						</button>
					</div>
				</div>
			</aside>
		</>
	);
};

export default memo(Aside);
