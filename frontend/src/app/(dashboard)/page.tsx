import { FirmsAdmin } from "@/components/shared/ui-demo/firms-admin/_firms-admin";
import TableObjects from "@/components/shared/ui-demo/table-obects/_table-obects";
import { getAuthMe } from "@/action/auth/login-me.action";
import { getComplexes } from "@/action/complex/get-complexes.api";
import { getAuthData } from "@/lib/auth.util";
import { redirect } from "next/navigation";

export default async function Home() {
	const { access } = await getAuthData();
	if (!access) redirect("/login");

	const [me, complexes] = await Promise.all([getAuthMe(), getComplexes()]);

	return me.data?.is_platform_admin ? (
		<FirmsAdmin />
	) : (
		<TableObjects initialComplex={complexes} />
	);
}
