"use client";

import { KeyRound, ShieldCheck, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/kit/page-header";
import UsersTableOfManagement from "../management-tables/_users-table";
import RolesTableOfManagement from "../management-tables/_roles-tables";
import PermissionsTableOfManagement from "../management-tables/_permissions-tables";

export function TabsManagement() {
	const t = useTranslations("tabs");
	const tn = useTranslations("nav");
	const tm = useTranslations("management");

	return (
		<div>
			<PageHeader title={tn("management")} description={tm("page_hint")} />
			<Tabs defaultValue="users">
				<TabsList>
					<TabsTrigger value="users">
						<Users />
						{t("users")}
					</TabsTrigger>
					<TabsTrigger value="roles">
						<ShieldCheck />
						{t("roles")}
					</TabsTrigger>
					<TabsTrigger value="permissions">
						<KeyRound />
						{t("permissions")}
					</TabsTrigger>
				</TabsList>
				<TabsContent value="users">
					<UsersTableOfManagement />
				</TabsContent>
				<TabsContent value="roles">
					<RolesTableOfManagement />
				</TabsContent>
				<TabsContent value="permissions">
					<PermissionsTableOfManagement />
				</TabsContent>
			</Tabs>
		</div>
	);
}
