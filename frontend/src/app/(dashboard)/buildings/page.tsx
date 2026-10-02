import { getBuildings } from "@/action/buildings/get-buildings.api";
import TableBuildings from "@/components/shared/ui-demo/table-buildings/_table-buildings";
import { getAuthData } from "@/lib/auth.util";
import { redirect } from "next/navigation";
export default async function BuildingsPage() {
	const { access } = await getAuthData();

	if (!access) {
		redirect("/login");
	}
	const buildings = await getBuildings({});
	return (
		<div>
			<TableBuildings buildings={buildings} />
		</div>
	);
}
