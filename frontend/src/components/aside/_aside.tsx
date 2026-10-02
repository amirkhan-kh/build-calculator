"use client";

import React, { memo, useCallback, useTransition } from "react";
import { navigation } from "../shared/nav-link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { CiLogout } from "react-icons/ci";
import Link from "next/link";
import { logoutAction } from "@/action/auth/logout.action";
import { useAuthMe } from "@/action/hooks/login-hook/use-auth-me";

interface IasideProps {
	isOpen: boolean;
}

const Aside: React.FC<IasideProps> = ({ isOpen }) => {
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();
	const t = useTranslations("nav");
	const { data: me } = useAuthMe();
	const isPlatformAdmin = !!me?.data?.is_platform_admin;
	const navItems = isPlatformAdmin
		? [{ navKey: "firms" as const, icon: navigation[0].icon, pathName: "/" as const }]
		: navigation;

	const handleLogout = useCallback(() => {
		startTransition(async () => {
			await logoutAction();
		});
	}, []);

	return (
		<aside
			className={`
        fixed top-0 left-0 h-full w-64 bg-[#282963] px-1 flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        shadow-xl z-30 pt-18
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
		>
			<ul className="space-y-1 py-2">
				{navItems.map((item) => {
					const Icon = item.icon;
					const isActive = pathname === item.pathName;

					return (
						<li key={item.navKey}>
							<Link
								href={item.pathName}
								className={`flex items-start gap-2 px-4 py-3 transition-all rounded-[3px]
                  ${isActive ? " text-white shadow " : "text-gray-300 hover:text-white "}
                `}
								style={{
									background: isActive
										? "linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)"
										: "transparent",
								}}
							>
								<Icon size={18} />
								<span className="font-medium">{t(item.navKey)}</span>
							</Link>
						</li>
					);
				})}
			</ul>
			<div className="pb-3">
				<button
					onClick={handleLogout}
					disabled={isPending}
					className="w-full px-4 py-2 text-white shadow flex items-center font-medium gap-2 rounded-[3px]"
					style={{
						background:
							"linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)",
					}}
				>
					<CiLogout />
					<span className="text-sm">{t("logout")}</span>
				</button>
			</div>
		</aside>
	);
};

export default memo(Aside);
