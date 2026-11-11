import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/shared/kit/empty-state";
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
	const [tc, buildingSafe, complexes] = await Promise.all([
		getTranslations("common"),
		getBuildingById(id),
		getComplexes(),
	]);

	const building = buildingSafe.data;

	if (!building) {
		return (
			<EmptyState
				className="mt-10"
				icon={SearchX}
				title={tc("not_found")}
				action={
					<Link href="/" className="text-sm font-medium text-ink hover:underline">
						{tc("back_to_list")}
					</Link>
				}
			/>
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
