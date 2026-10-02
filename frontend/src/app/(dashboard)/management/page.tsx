import { TabsManagement } from "@/components/shared/ui-demo/tabs/_tab-management";
import { getAuthMe } from "@/action/auth/login-me.action";
import { getAuthData } from "@/lib/auth.util";
import { redirect } from "next/navigation";

const UsersEmployes = async () => {
	const { access } = await getAuthData();
	if (!access) redirect("/login");
	const me = await getAuthMe();
	if (me.data?.is_platform_admin) redirect("/");
	return <TabsManagement />;
};

export default UsersEmployes;
