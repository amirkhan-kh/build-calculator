import { redirect } from "next/navigation";
import { getApartments } from "@/action/apartaments/get-apartaments.api";
import TableApartments from "@/components/shared/ui-demo/table-apartments/_table-apartments";
import { getAuthData } from "@/lib/auth.util";

export default async function ApartmentsPage() {
	const { access } = await getAuthData();

	if (!access) {
		redirect("/login");
	}
	const apartments = await getApartments();
	return <TableApartments initialApartments={apartments} />;
}
