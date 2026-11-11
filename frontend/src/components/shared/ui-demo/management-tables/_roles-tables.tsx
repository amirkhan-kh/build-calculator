"use client";

import React, { useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRoles } from "@/action/hooks/roles-hook/use-roles";
import CreateRole from "../modals/role-modals/create-role-modal/_create-role-modal";
import DeleteRole from "../modals/role-modals/delete-role-modal/_delete-role";
import PatchRoleManagement from "../modals/role-modals/patch-role-modal/_patch-role";
import { EmptyState, LoadingState } from "@/components/shared/kit/empty-state";
import { cn } from "@/lib/cn";

const RolesTableOfManagement: React.FC = () => {
	const { data: roles, isLoading } = useRoles();
	const t = useTranslations("management");
	const [expanded, setExpanded] = useState<number | null>(null);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm text-slate-500">{t("roles_count", { count: roles?.length ?? 0 })}</p>
				<CreateRole />
			</div>

			{isLoading ? (
				<LoadingState />
			) : !roles || roles.length === 0 ? (
				<EmptyState icon={ShieldCheck} title={t("no_roles")} />
			) : (
				<ul className="surface divide-y divide-slate-100 overflow-hidden">
					{roles.map((role) => {
						const perms = role.permissions ?? [];
						const isOpen = expanded === role.id;
						return (
							<li key={role.id}>
								<div className="flex items-center gap-3 px-4 py-3">
									<button
										type="button"
										onClick={() => setExpanded(isOpen ? null : role.id)}
										aria-expanded={isOpen}
										className="flex min-w-0 flex-1 items-center gap-3 text-left"
									>
										<span
											className={cn(
												"grid size-9 shrink-0 place-items-center rounded-lg",
												perms.length ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400",
											)}
										>
											<ShieldCheck size={17} />
										</span>
										<span className="min-w-0">
											<span className="block truncate font-medium text-slate-900">{role.name}</span>
											<span className="block text-xs text-slate-500">
												{perms.length ? t("permissions_count", { count: perms.length }) : t("no_permissions")}
											</span>
										</span>
										<ChevronDown
											size={16}
											className={cn("ml-auto shrink-0 text-slate-400 transition-transform", isOpen && "rotate-180")}
										/>
									</button>
									<div className="flex shrink-0 gap-0.5">
										<PatchRoleManagement role={role} />
										<DeleteRole roleId={role.id} roleName={role.name} />
									</div>
								</div>
								{isOpen && (
									<div className="animate-in fade-in-0 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
										{perms.length ? (
											<div className="flex flex-wrap gap-1.5">
												{perms.map((perm) => (
													<code
														key={perm.id}
														className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11.5px] text-slate-700"
													>
														{perm.codename}
													</code>
												))}
											</div>
										) : (
											<p className="text-xs text-slate-400">{t("no_permissions")}</p>
										)}
									</div>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export default RolesTableOfManagement;
