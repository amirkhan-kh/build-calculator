import React, { memo } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { PanelLeft } from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/language-switcher/_language-switcher";
import { isNavActive, navigation, platformNavigation } from "@/components/shared/nav-link";
import { useAuthMe } from "@/action/hooks/login-hook/use-auth-me";

interface HeaderProps {
	onToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggle }) => {
	const pathname = usePathname();
	const t = useTranslations("nav");
	const { data: me } = useAuthMe();
	const items = me?.data?.is_platform_admin ? platformNavigation : navigation;
	const current = items.find((item) => isNavActive(item.pathName, pathname));

	return (
		<header className="sticky top-0 z-20 px-3 pt-3 sm:px-6">
			<div className="glass flex h-14 items-center gap-3 rounded-2xl px-2.5 sm:px-3">
				<button
					type="button"
					onClick={onToggle}
					aria-label={t("toggle_menu")}
					className="grid size-9 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-900"
				>
					<PanelLeft size={18} />
				</button>
				<span className="h-5 w-px bg-slate-200" />
				<p className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-tight text-slate-900">
					{current ? t(current.navKey) : ""}
				</p>
				<LanguageSwitcher />
			</div>
		</header>
	);
};

export default memo(Header);
