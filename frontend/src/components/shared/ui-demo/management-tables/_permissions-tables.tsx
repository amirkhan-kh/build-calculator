"use client";

import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePermissions } from "@/action/hooks/permissions-hook/use-permissions-hook";
import CreatePermissionsManagement from "../modals/permission-modals/create-permission-modal/_create-permission";
import DeletePermissionManagement from "../modals/permission-modals/delete-permission-modal/_delete-permission";
import PatchPermissionManagement from "../modals/permission-modals/patch-permission-modal/_patch-permission";
import { Badge } from "@/components/ui/badge";

const PermissionsTableOfManagement: React.FC = () => {
	const { data: permissions, isLoading } = usePermissions();
	const t = useTranslations("management");

	if (isLoading) return <Loader2 className="animate-spin m-10" />;

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>{t("codename_col")}</TableHead>
					<TableHead>{t("access_type_col")}</TableHead>
					<TableHead className="flex justify-end py-2">
						<CreatePermissionsManagement />
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{permissions?.map((perm) => (
					<TableRow key={perm.id}>
						<TableCell>
							<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
								{perm.codename}
							</code>
						</TableCell>
						<TableCell>
							<Badge variant="outline">
								<span className="text-xs capitalize">
									{perm.codename.split("_")[0]} {t("access_suffix")}
								</span>
							</Badge>
						</TableCell>

						<TableCell className="flex gap-2 justify-end">
							<PatchPermissionManagement permission={perm} />
							<DeletePermissionManagement
								permissionId={perm.id}
								codename={perm.codename}
							/>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default PermissionsTableOfManagement;
