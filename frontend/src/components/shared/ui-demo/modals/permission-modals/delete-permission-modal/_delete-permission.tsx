"use client";

import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDeletePermission } from "@/action/hooks/permissions-hook/use-delete-permission-hook";
import type { PropsDeletePermissionManagement } from "@/types/props.types";
import { MdOutlineDeleteForever } from "react-icons/md";

const DeletePermissionManagement: React.FC<PropsDeletePermissionManagement> = ({
	permissionId,
	codename,
}) => {
	const [open, setOpen] = useState<boolean>(false);
	const { mutate: removePermission, isPending } = useDeletePermission();
	const t = useTranslations("management");
	const tc = useTranslations("common");

	const handleDelete = () => {
		removePermission(permissionId, {
			onSuccess: (res) => {
				if (!res._meta) {
					setOpen(false);
				}
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button className="text-gray-200 hover:text-white bg-indigo-900 px-3 py-1 rounded-[3px]">
					<MdOutlineDeleteForever />
				</button>
			</DialogTrigger>
			<DialogContent className="max-w-96">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-red-600">
						{t("delete_permission_title")}
					</DialogTitle>
				</DialogHeader>

				<div className="py-4">
					<p className="text-sm text-gray-600">
						{t("delete_permission_confirm", { codename: codename ?? "" })}
					</p>
				</div>

				<DialogFooter className="space-x-2.5">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isPending}
						className="flex-1 text-[13px]"
					>
						{tc("cancel")}
					</Button>
					<Button
						onClick={handleDelete}
						disabled={isPending}
						className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[13px]"
					>
						{isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							tc("delete")
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeletePermissionManagement;
