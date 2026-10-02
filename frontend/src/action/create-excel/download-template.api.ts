import { ENV } from "@/configs/env.config";
import { getAuthData } from "@/lib/auth.util";

export async function downloadApartmentTemplate(
	buildingId: number | string,
	buildingName?: string,
): Promise<void> {
	const authData = await getAuthData();
	if (!authData?.access) return;

	const res = await fetch(
		`${ENV.PUBLIC_API_URL}/apartments/template/?building_id=${buildingId}`,
		{
			headers: { Authorization: `Bearer ${authData.access}` },
		},
	);

	if (!res.ok) return;

	const blob = await res.blob();
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = buildingName
		? `template_${buildingName}.xlsx`
		: "template_apartments.xlsx";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
