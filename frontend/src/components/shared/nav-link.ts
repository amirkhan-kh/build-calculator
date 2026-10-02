import { Route } from "next";
import { FaBuilding, FaCalculator, FaUsers } from "react-icons/fa";

interface INavigation {
	navKey: "objects" | "calculator" | "management";
	icon: React.ComponentType<{ size?: string | number }>;
	pathName: Route;
}

export const navigation: INavigation[] = [
	{ navKey: "objects", icon: FaBuilding, pathName: "/" },
	{ navKey: "calculator", icon: FaCalculator, pathName: "/calculator-system" },
	{ navKey: "management", icon: FaUsers, pathName: "/management" },
] as const;
