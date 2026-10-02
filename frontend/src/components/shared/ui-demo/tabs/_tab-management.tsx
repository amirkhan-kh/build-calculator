"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersTableOfManagement from "../management-tables/_users-table";
import RolesTableOfManagement from "../management-tables/_roles-tables";
import PermissionsTableOfManagement from "../management-tables/_permissions-tables";

export function TabsManagement() {
	const t = useTranslations("tabs");

	return (
		<Tabs defaultValue="users">
			<TabsList>
				<TabsTrigger value="users">{t("users")}</TabsTrigger>
				<TabsTrigger value="roles">{t("roles")}</TabsTrigger>
				<TabsTrigger value="permissions">{t("permissions")}</TabsTrigger>
			</TabsList>
			<TabsContent value="users">
				<Card>
					<UsersTableOfManagement />
				</Card>
			</TabsContent>
			<TabsContent value="roles">
				<Card>
					<RolesTableOfManagement />
				</Card>
			</TabsContent>
			<TabsContent value="permissions">
				<Card>
					<PermissionsTableOfManagement />
				</Card>
			</TabsContent>
		</Tabs>
	);
}
