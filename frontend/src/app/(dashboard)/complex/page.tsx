import { getAuthMe } from "@/action/auth/login-me.action";
import { getComplexes } from "@/action/complex/get-complexes.api";
import TableObjects from "@/components/shared/ui-demo/table-obects/_table-obects";
import { getAuthData } from "@/lib/auth.util";
import { redirect } from "next/navigation";

export default async function Complex() {
	const { access } = await getAuthData();
	if (!access) {
		redirect("/login");
	}
	const me = await getAuthMe();
	if (me.data?.is_platform_admin) {
		redirect("/");
	}
	const buildings = await getComplexes();
	return (
		<>
			<TableObjects initialComplex={buildings} />
		</>
	);
}
