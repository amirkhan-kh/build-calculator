"use client";
import Aside from "@/components/aside/_aside";
import Header from "@/components/header/_header";
import MainLayout from "@/components/main/_main";
import { AuthGuard } from "@/components/auth-guard/_auth-guard";
import React, { ReactNode, useCallback, useEffect, useState } from "react";

interface DashboardLayoutProps {
	children: ReactNode;
}

const SIDEBAR_KEY = "sidebar-open";

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
	const [isOpen, setIsOpen] = useState(true);

	useEffect(() => {
		const stored = localStorage.getItem(SIDEBAR_KEY);
		if (stored !== null) setIsOpen(stored === "true");
	}, []);

	const handleSidebarChange = useCallback((value: boolean) => {
		setIsOpen(value);
		localStorage.setItem(SIDEBAR_KEY, String(value));
	}, []);

	return (
		<>
		<AuthGuard />
		<div className="min-h-screen bg-[#f8f9fab0]">
			<Header isOpen={isOpen} setIsOpen={handleSidebarChange} />
			<Aside isOpen={isOpen} />
			<main
				className={`pt-20 transition-all duration-300 ${
					isOpen ? "ml-64" : "ml-0"
				}`}
			>
				<MainLayout>{children}</MainLayout>
			</main>
		</div>
		</>
	);
};

export default DashboardLayout;
