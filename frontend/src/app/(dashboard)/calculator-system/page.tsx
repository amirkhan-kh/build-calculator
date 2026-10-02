import { redirect } from "next/navigation";
import { CalculatorClientPage } from "@/components/shared/calculator-client/_calculator-client";
import { getAuthData } from "@/lib/auth.util";
import { getAuthMe } from "@/action/auth/login-me.action";

export default async function CalculatorPage() {
    const { access } = await getAuthData();
    if (!access) {
        redirect("/login");
    }
    const me = await getAuthMe();
    if (me.data?.is_platform_admin) {
        redirect("/");
    }
    return <CalculatorClientPage />;
}
