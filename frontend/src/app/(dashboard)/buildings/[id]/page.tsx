import { ImFileEmpty } from "react-icons/im";
import { TabsDemoBuildings } from "@/components/shared/ui-demo/tabs/_tab-buildings";
import Link from "next/link";
import { getBuildingById } from "@/action/buildings/get-building.api";
import { getComplexes } from "@/action/complex/get-complexes.api";
import type { IComplex } from "@/types/complex.types";
import { getAuthData } from "@/lib/auth.util";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Props } from "@/types/props.types";

export default async function SingleBuildingPage({ params }: Props) {
	const { access } = await getAuthData();

	if (!access) {
		redirect("/login");
	}
	const { id } = await params;
	if (!id) {
		redirect("/");
	}
	const tc = await getTranslations("common");
	const [buildingSafe, complexes] = await Promise.all([
		getBuildingById(id),
		getComplexes(),
	]);

	const building = buildingSafe.data;

	if (!building) {
		return (
			<div className="flex items-center justify-center flex-col h-screen text-gray-500">
				<ImFileEmpty size={40} className="mb-2 text-gray-300" />
				<p className="text-center font-medium font-sans">
					{tc("not_found")}
				</p>
				<Link
					href="/buildings"
					className="mt-4 px-6 py-2 bg-[#282964] text-white rounded-[3px] text-sm"
				>
					{tc("back_to_list")}
				</Link>
			</div>
		);
	}

	return (
		<div>
			<TabsDemoBuildings
				initialBuilding={building}
				allComplexes={complexes as IComplex[]}
			/>
		</div>
	);
}
