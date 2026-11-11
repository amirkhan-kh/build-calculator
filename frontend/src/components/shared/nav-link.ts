import { Route } from "next";
import { Briefcase, Building2, Calculator, Users, type LucideIcon } from "lucide-react";

export type NavKey = "objects" | "calculator" | "management" | "firms";

interface INavigation {
	navKey: NavKey;
	icon: LucideIcon;
	pathName: Route;
}

export const navigation: INavigation[] = [
	{ navKey: "objects", icon: Building2, pathName: "/" },
	{ navKey: "calculator", icon: Calculator, pathName: "/calculator-system" },
	{ navKey: "management", icon: Users, pathName: "/management" },
];

export const platformNavigation: INavigation[] = [
	{ navKey: "firms", icon: Briefcase, pathName: "/" },
];

const OBJECT_ROUTES = /^\/(complex|buildings|apartments)(\/|$)/;

export function isNavActive(pathName: string, pathname: string) {
	if (pathName === "/") return pathname === "/" || OBJECT_ROUTES.test(pathname);
	return pathname === pathName || pathname.startsWith(`${pathName}/`);
}
