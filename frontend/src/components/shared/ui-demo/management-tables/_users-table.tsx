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
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUsers } from "@/action/hooks/users-hook/users-get.hook";
import { useRoles } from "@/action/hooks/roles-hook/use-roles";
import { usePatchUser } from "@/action/hooks/users-hook/user-patch.hook";
import { Badge } from "@/components/ui/badge";
import DeleteUserManagement from "../modals/user-modal-management/delete-user-modal/_delete-user-modal";
import PatchUserManagement from "../modals/user-modal-management/patch-user-modal/_patch-user-modal";
import CreateUserManagement from "../modals/user-modal-management/create-user-modal/_create-user-management";
import { useAuthMe } from "@/action/hooks/login-hook/use-auth-me";

const UsersTableOfManagement: React.FC = () => {
	const { data: users, isLoading: usersLoading } = useUsers();
	const { data: roles } = useRoles();
	const { mutate: updateUser, isPending: isUpdating } = usePatchUser();
	const { data: currentUserData } = useAuthMe();
	const t = useTranslations("management");

	const currentUsername = currentUserData?.data?.username;
	if (usersLoading) return <Loader2 className="animate-spin m-10" />;

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-20">{t("number_col")}</TableHead>
					<TableHead>{t("username_col")}</TableHead>
					<TableHead>{t("current_role_col")}</TableHead>
					<TableHead className="text-right">{t("assign_role_col")}</TableHead>
					<TableHead className="flex justify-end py-2">
						<CreateUserManagement />
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{users?.map((user, i) => {
					const isMe = user.username === currentUsername;

					return (
						<TableRow key={user.id} className={isMe ? "bg-gray-50/50" : ""}>
							<TableCell className={isMe ? "opacity-50" : ""}>
								{i + 1}
							</TableCell>
							<TableCell
								className={`font-medium ${isMe ? "text-[#282964] disabled:cursor-not-allowed disabled:opacity-50" : ""}`}
							>
								{user.username}{" "}
								{isMe && (
									<span className="text-[10px] ml-1 font-normal text-gray-400">
										({t("you_label")})
									</span>
								)}
							</TableCell>
							<TableCell>
								{user.role_id ? (
									<Badge variant="outline">
										{roles?.find((r) => r.id === user.role_id)?.name ||
											t("role_placeholder")}
									</Badge>
								) : (
									<Badge variant="destructive">{t("no_role")}</Badge>
								)}
							</TableCell>
							<TableCell className="text-right">
								<Select
									disabled={isUpdating || isMe}
									defaultValue={user.role_id?.toString()}
									onValueChange={(value) =>
										updateUser({
											id: user.id,
											data: { role_id: Number(value) },
										})
									}
								>
									<SelectTrigger
										className={`w-48 ml-auto ${isMe ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
									>
										<SelectValue placeholder={t("select_role")} />
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
							<TableCell className="text-right">
								<div
									className={`flex justify-end gap-2 ${
										isMe
											? "opacity-40 grayscale pointer-events-none cursor-not-allowed"
											: ""
									}`}
									title={isMe ? t("self_edit_warning") : ""}
								>
									<PatchUserManagement user={user} />
									<DeleteUserManagement
										userId={user.id}
										username={user.username}
									/>
								</div>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
};

export default UsersTableOfManagement;
