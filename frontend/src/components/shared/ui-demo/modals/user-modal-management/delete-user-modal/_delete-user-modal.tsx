"use client";

import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { MdOutlineDeleteForever } from "react-icons/md";
import { useTranslations } from "next-intl";
import { useDeleteUser } from "@/action/hooks/users-hook/user-delete.hook";
import { Button } from "@/components/ui/button";

interface Props {
	userId: number | string;
	username: string;
}

const DeleteUserManagement: React.FC<Props> = ({ userId, username }) => {
	const [open, setOpen] = useState(false);
	const deleteMutation = useDeleteUser();
	const t = useTranslations("management");
	const tc = useTranslations("common");

	const handleDelete = () => {
		deleteMutation.mutate(userId, {
			onSuccess: () => {
				setOpen(false);
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
			<DialogContent className="sm:max-w-md">
				<DialogTitle className="text-lg font-semibold text-center">
					{t("delete_user_title")}
				</DialogTitle>

				<div className="py-4">
					<p className="text-center text-gray-600 mb-6">
						{t("delete_user_confirm", { username })}
					</p>

					<div className="flex justify-center gap-4">
						<Button
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={deleteMutation.isPending}
							className="min-w-20"
						>
							{tc("no")}
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={deleteMutation.isPending}
							className="min-w-20 bg-red-600 hover:bg-red-700 text-white"
						>
							{deleteMutation.isPending ? tc("deleting") : tc("yes")}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteUserManagement;
