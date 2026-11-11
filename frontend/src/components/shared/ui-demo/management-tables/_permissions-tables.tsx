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
import { KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePermissions } from "@/action/hooks/permissions-hook/use-permissions-hook";
import CreatePermissionsManagement from "../modals/permission-modals/create-permission-modal/_create-permission";
import DeletePermissionManagement from "../modals/permission-modals/delete-permission-modal/_delete-permission";
import PatchPermissionManagement from "../modals/permission-modals/patch-permission-modal/_patch-permission";
import { EmptyState, LoadingState } from "@/components/shared/kit/empty-state";

const PermissionsTableOfManagement: React.FC = () => {
	const { data: permissions, isLoading } = usePermissions();
	const t = useTranslations("management");

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm text-slate-500">{t("permissions_count", { count: permissions?.length ?? 0 })}</p>
				<CreatePermissionsManagement />
			</div>

			{isLoading ? (
				<LoadingState />
			) : !permissions || permissions.length === 0 ? (
				<EmptyState icon={KeyRound} title={t("no_permissions")} />
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t("codename_col")}</TableHead>
							<TableHead>{t("access_type_col")}</TableHead>
							<TableHead className="w-24" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{permissions.map((perm) => (
							<TableRow key={perm.id}>
								<TableCell>
									<code className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[12.5px] font-medium text-slate-800">
										{perm.codename}
									</code>
								</TableCell>
								<TableCell>
									<span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600">
										{perm.codename.split("_")[0]} {t("access_suffix")}
									</span>
								</TableCell>
								<TableCell>
									<div className="flex justify-end gap-0.5">
										<PatchPermissionManagement permission={perm} />
										<DeletePermissionManagement permissionId={perm.id} codename={perm.codename} />
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
};

export default PermissionsTableOfManagement;
