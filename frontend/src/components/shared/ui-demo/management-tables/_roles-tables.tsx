"use client";

import React from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Loader2, Shield, Lock, Unlock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRoles } from "@/action/hooks/roles-hook/use-roles";
import CreateRole from "../modals/role-modals/create-role-modal/_create-role-modal";
import { IPermission } from "@/types/permissions.types";
import DeleteRole from "../modals/role-modals/delete-role-modal/_delete-role";
import PatchRoleManagement from "../modals/role-modals/patch-role-modal/_patch-role";

const RolesTableOfManagement: React.FC = () => {
	const { data: roles, isLoading } = useRoles();
	const t = useTranslations("management");

	if (isLoading)
		return (
			<div className="flex justify-center items-center h-64">
				<div className="relative">
					<div className="absolute inset-0 rounded-full bg-[#7107e7]/20 blur-xl animate-pulse"></div>
					<Loader2 className="animate-spin h-8 w-8 text-[#46479f] relative" />
				</div>
			</div>
		);

	return (
		<div className="space-y-2 bg-gradient-to-br from-indigo-200 via-indigo-50 to-indigo-200 p-4 rounded-sm">
			<div className="flex justify-end ">
				<CreateRole />
			</div>

			<div className="space-y-2">
				{roles?.map((role, index) => {
					const permissionsCount = role.permissions?.length || 0;
					const hasPermissions = permissionsCount > 0;

					return (
						<Card
							key={role.id}
							className="border border-[#d4ddff] bg-white rounded-sm backdrop-blur-sm hover:border-[#46479f]/30 transition-all duration-500 group flex items-center px-2"
						>
							<Accordion type="single" collapsible className="w-full">
								<AccordionItem value={role.id.toString()} className="border-0">
									<div className="flex items-center">
										<div className="w-8 text-[10px] font-mono text-gray-500 group-hover:text-[#46479f]/30 transition-colors">
											{String(index + 1)}
										</div>

										<AccordionTrigger className="flex-1 hover:no-underline py-4">
											<div className="flex items-center gap-4">
												<div
													className={`p-2 rounded-md transition-all duration-300 ${
														hasPermissions
															? "bg-gradient-to-br from-[#400189]/5 to-[#46479f]/5 group-hover:from-[#400189]/10 group-hover:to-[#46479f]/10"
															: "bg-gray-50 group-hover:bg-gray-100"
													}`}
												>
													{hasPermissions ? (
														<Unlock className="h-4 w-4 text-[#46479f]/70" />
													) : (
														<Lock className="h-4 w-4 text-gray-300" />
													)}
												</div>

												<div className="text-left flex gap-3">
													<span
														className={`font-medium text-sm transition-colors ${
															hasPermissions ? "text-gray-900" : "text-gray-400"
														}`}
													>
														{role.name}
													</span>

													{permissionsCount > 0 && (
														<span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#d4ddff]/30 text-[#46479f]">
															{t("capabilities", { count: permissionsCount })}
														</span>
													)}
												</div>
											</div>
										</AccordionTrigger>
									</div>

									<AccordionContent className="">
										<div className="px-6">
											{hasPermissions ? (
												<div className="">
													<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 pt-2">
														{role.permissions?.map((perm: IPermission) => {
															const permName = perm.codename || "Unnamed";
															const formattedName = permName
																.replace(/_/g, " ")
																.replace(/\b\w/g, (l: string) => l.toUpperCase());

															return (
																<div key={perm.id} className="group/permission relative">
																	<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#46479f]/30 opacity-0 group-hover/permission:opacity-100 transition-opacity" />
																	<span className="block pl-3 text-[11px] text-gray-500 hover:text-[#46479f] transition-colors truncate">
																		{formattedName}
																	</span>
																</div>
															);
														})}
													</div>

													<div className="text-[10px] text-gray-300 pt-1">
														{t("permissions_count", { count: permissionsCount })}
													</div>
												</div>
											) : (
												<div className="py-3">
													<div className="h-px bg-gray-100"></div>
													<div className="flex items-center gap-2 pt-3">
														<Lock size={12} className="text-gray-300" />
														<span className="text-xs text-gray-300 font-light italic">
															{t("no_permissions")}
														</span>
													</div>
												</div>
											)}
										</div>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
							<div className="flex justify-end gap-1">
								<PatchRoleManagement role={role} />
								<DeleteRole roleId={role.id} roleName={role.name} />
							</div>
						</Card>
					);
				})}

				{(!roles || roles.length === 0) && (
					<div className="text-center py-16">
						<div className="inline-flex p-3 rounded-full bg-[#f0f3ff] mb-4">
							<Shield className="h-6 w-6 text-[#46479f]/30" />
						</div>
						<p className="text-sm text-gray-400 font-light">
							{t("no_roles")}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default RolesTableOfManagement;
