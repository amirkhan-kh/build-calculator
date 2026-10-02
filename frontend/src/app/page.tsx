import DashboardLayout from "@/components/layouts/dashboard-layout/_dashboard-layout";
import { FirmsAdmin } from "@/components/shared/ui-demo/firms-admin/_firms-admin";
import { getAuthMe } from "@/action/auth/login-me.action";
import Complex from "./(dashboard)/complex/page";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
	const cookieStore = await cookies();
	const token = cookieStore.get("access_token")?.value;

	if (!token) redirect("/login");

	const me = await getAuthMe();

	return (
		<DashboardLayout>
			{me.data?.is_platform_admin ? <FirmsAdmin /> : <Complex />}
		</DashboardLayout>
	);
}
