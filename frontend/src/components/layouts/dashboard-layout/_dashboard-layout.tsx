"use client";
import Aside from "@/components/aside/_aside";
import Header from "@/components/header/_header";
import MainLayout from "@/components/main/_main";
import { AuthGuard } from "@/components/auth-guard/_auth-guard";
import { cn } from "@/lib/cn";
import { usePathname } from "next/navigation";
import React, { ReactNode, useCallback, useEffect, useState } from "react";

interface DashboardLayoutProps {
	children: ReactNode;
}

const SIDEBAR_KEY = "sidebar-open";
const DESKTOP_QUERY = "(min-width: 1024px)";

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	const [lastPath, setLastPath] = useState(pathname);
	if (lastPath !== pathname) {
		setLastPath(pathname);
		setMobileOpen(false);
	}

	useEffect(() => {
		const stored = localStorage.getItem(SIDEBAR_KEY);
		// localStorage is only readable after hydration
		// eslint-disable-next-line react-hooks/set-state-in-effect
		if (stored !== null) setCollapsed(stored === "false");
	}, []);

	const handleToggle = useCallback(() => {
		if (window.matchMedia(DESKTOP_QUERY).matches) {
			setCollapsed((prev) => {
				localStorage.setItem(SIDEBAR_KEY, String(prev));
				return !prev;
			});
		} else {
			setMobileOpen((prev) => !prev);
		}
	}, []);

	const closeMobile = useCallback(() => setMobileOpen(false), []);

	return (
		<>
			<AuthGuard />
			<div className="min-h-screen">
				<Aside collapsed={collapsed} mobileOpen={mobileOpen} onClose={closeMobile} />
				<div
					className={cn(
						"transition-[padding] duration-300 ease-out",
						collapsed ? "lg:pl-[88px]" : "lg:pl-[264px]",
					)}
				>
					<Header onToggle={handleToggle} />
					<MainLayout>{children}</MainLayout>
				</div>
			</div>
		</>
	);
};

export default DashboardLayout;
