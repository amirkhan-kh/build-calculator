"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePatchRole } from "@/action/hooks/roles-hook/use-patch-role";
import { usePermissions } from "@/action/hooks/permissions-hook/use-permissions-hook";
import type { IPatchRolePayload } from "@/types/permissions.types";
import type { PropsPatchRoleManagement } from "@/types/props.types";
import { FiEdit3 } from "react-icons/fi";

const PatchRoleManagement: React.FC<PropsPatchRoleManagement> = ({ role }) => {
	const [open, setOpen] = useState<boolean>(false);
	const [name, setName] = useState<string>(role.name);
	const [selectedIds, setSelectedIds] = useState<number[]>([]);

	const { data: allPermissions, isLoading: permsLoading } = usePermissions();
	const { mutate: updateRole, isPending } = usePatchRole();
	const t = useTranslations("management");
	const tc = useTranslations("common");

	useEffect(() => {
		if (open && role.permissions) {
			setSelectedIds(role.permissions.map((p) => p.id));
			setName(role.name);
		}
	}, [open, role]);

	const isAllSelected = useMemo(() => {
		return (
			allPermissions &&
			allPermissions.length > 0 &&
			selectedIds.length === allPermissions.length
		);
	}, [allPermissions, selectedIds]);

	const handleSelectAll = (checked: boolean) => {
		if (checked && allPermissions) {
			setSelectedIds(allPermissions.map((p) => p.id));
		} else {
			setSelectedIds([]);
		}
	};

	const handleToggle = (id: number, checked: boolean) => {
		setSelectedIds((prev) =>
			checked ? [...prev, id] : prev.filter((pId) => pId !== id),
		);
	};

	const handleSave = () => {
		const payload: IPatchRolePayload = {
			name: name,
			permission_ids: selectedIds,
		};

		updateRole(
			{ id: role.id, payload },
			{
				onSuccess: (res) => {
					if (!res._meta) setOpen(false);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button className="text-gray-200 hover:text-white bg-indigo-900 px-3 h-8 flex items-center justify-center rounded-[3px] transition-colors">
					<FiEdit3 />
				</button>
			</DialogTrigger>
			<DialogContent className="max-w-96">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold">
						{t("edit_role_title")}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">{t("role_name_label")}</label>
						<Input
							value={name}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setName(e.target.value)
							}
							placeholder={t("role_name_placeholder")}
						/>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<label className="text-sm font-medium">{t("permissions_label")}</label>

							{!permsLoading && allPermissions && allPermissions.length > 0 && (
								<div className="flex items-center space-x-2 bg-indigo-50 px-2 py-1 rounded">
									<Checkbox
										id="edit-select-all"
										checked={isAllSelected}
										onCheckedChange={(checked: boolean) =>
											handleSelectAll(checked)
										}
									/>
									<label
										htmlFor="edit-select-all"
										className="text-[10px] font-bold cursor-pointer uppercase text-indigo-900 select-none"
									>
										{t("select_all")}
									</label>
								</div>
							)}
						</div>

						<ScrollArea className="h-60 border rounded-md p-2 bg-white">
							{permsLoading ? (
								<div className="flex justify-center items-center h-full">
									<Loader2 className="animate-spin text-indigo-900" />
								</div>
							) : (
								<div className="space-y-2.5">
									{allPermissions?.map((perm) => (
										<div
											key={perm.id}
											className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded transition-colors"
										>
											<Checkbox
												id={`edit-perm-${perm.id}`}
												checked={selectedIds.includes(perm.id)}
												onCheckedChange={(checked: boolean) =>
													handleToggle(perm.id, checked)
												}
											/>
											<label
												htmlFor={`edit-perm-${perm.id}`}
												className="text-xs cursor-pointer select-none flex-1"
											>
												{perm.codename}
											</label>
										</div>
									))}
								</div>
							)}
						</ScrollArea>
						<p className="text-[11px] text-muted-foreground font-medium">
							{t("selected_of_total", { count: selectedIds.length, total: allPermissions?.length || 0 })}
						</p>
					</div>
				</div>

				<DialogFooter className="gap-2">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isPending}
					>
						{tc("cancel")}
					</Button>
					<Button
						onClick={handleSave}
						disabled={isPending || !name.trim()}
						className="bg-indigo-900 text-white min-w-24 hover:bg-indigo-800"
					>
						{isPending ? (
							<Loader2 className="animate-spin h-4 w-4" />
						) : (
							tc("save")
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default PatchRoleManagement;
