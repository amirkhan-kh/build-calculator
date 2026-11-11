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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUsers } from "@/action/hooks/users-hook/users-get.hook";
import { useRoles } from "@/action/hooks/roles-hook/use-roles";
import { usePatchUser } from "@/action/hooks/users-hook/user-patch.hook";
import DeleteUserManagement from "../modals/user-modal-management/delete-user-modal/_delete-user-modal";
import PatchUserManagement from "../modals/user-modal-management/patch-user-modal/_patch-user-modal";
import CreateUserManagement from "../modals/user-modal-management/create-user-modal/_create-user-management";
import { useAuthMe } from "@/action/hooks/login-hook/use-auth-me";
import { EmptyState, LoadingState } from "@/components/shared/kit/empty-state";
import { cn } from "@/lib/cn";

function initials(name: string) {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0]?.toUpperCase())
		.join("");
}

const UsersTableOfManagement: React.FC = () => {
	const { data: users, isLoading: usersLoading } = useUsers();
	const { data: roles } = useRoles();
	const { mutate: updateUser, isPending: isUpdating } = usePatchUser();
	const { data: currentUserData } = useAuthMe();
	const t = useTranslations("management");

	const currentUsername = currentUserData?.data?.username;

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm text-slate-500">{t("users_count", { count: users?.length ?? 0 })}</p>
				<CreateUserManagement />
			</div>

			{usersLoading ? (
				<LoadingState />
			) : !users || users.length === 0 ? (
				<EmptyState icon={Users} title={t("no_users")} />
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">{t("number_col")}</TableHead>
							<TableHead>{t("username_col")}</TableHead>
							<TableHead className="hidden md:table-cell">{t("phone_label")}</TableHead>
							<TableHead className="w-60">{t("role_label")}</TableHead>
							<TableHead className="w-24" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.map((user, i) => {
							const isMe = user.username === currentUsername;
							const display = user.fullname || user.username;
							return (
								<TableRow key={user.id} className={cn(isMe && "bg-indigo-50/40")}>
									<TableCell className="tabular-nums text-slate-400">{i + 1}</TableCell>
									<TableCell>
										<div className="flex items-center gap-3">
											<span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
												{initials(display)}
											</span>
											<div className="min-w-0">
												<p className="flex items-center gap-2 truncate font-medium text-slate-900">
													{display}
													{isMe && (
														<span className="rounded-full bg-ink px-2 py-px text-[10px] font-medium text-white">
															{t("you_label")}
														</span>
													)}
												</p>
												<p className="truncate text-xs text-slate-500">@{user.username}</p>
											</div>
										</div>
									</TableCell>
									<TableCell className="hidden tabular-nums text-slate-600 md:table-cell">
										{user.phone || "—"}
									</TableCell>
									<TableCell>
										<Select
											disabled={isUpdating || isMe}
											value={user.role_id ? user.role_id.toString() : undefined}
											onValueChange={(value) =>
												updateUser({ id: user.id, data: { role_id: Number(value) } })
											}
										>
											<SelectTrigger className="h-9 w-full">
												<SelectValue placeholder={t("no_role")} />
											</SelectTrigger>
											<SelectContent>
												{roles?.map((role) => (
													<SelectItem key={role.id} value={role.id.toString()}>
														{role.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</TableCell>
									<TableCell>
										{isMe ? (
											<span className="block text-right text-xs text-slate-400" title={t("self_edit_warning")}>
												—
											</span>
										) : (
											<div className="flex justify-end gap-0.5">
												<PatchUserManagement user={user} />
												<DeleteUserManagement userId={user.id} username={user.username} />
											</div>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			)}
		</div>
	);
};

export default UsersTableOfManagement;
