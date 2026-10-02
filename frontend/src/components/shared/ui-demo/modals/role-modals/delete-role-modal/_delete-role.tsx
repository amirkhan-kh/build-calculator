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
import { Loader2, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDeleteRole } from "@/action/hooks/roles-hook/use-delete-role";
import { PropsDeleteRole } from "@/types/props.types";
import { MdOutlineDeleteForever } from "react-icons/md";

const DeleteRole: React.FC<PropsDeleteRole> = ({ roleId, roleName }) => {
	const [open, setOpen] = useState<boolean>(false);
	const { mutate: removeRole, isPending } = useDeleteRole();
	const tc = useTranslations("common");

	const handleDelete = () => {
		removeRole(roleId, {
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
				<button className="text-gray-200 hover:text-white bg-indigo-900 px-3 py-1 rounded-[3px] transition-colors">
					<MdOutlineDeleteForever size={18} />
				</button>
			</DialogTrigger>
			<DialogContent className="max-w-[400px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-red-600">
						<AlertTriangle size={20} />
						{tc("delete")}
					</DialogTitle>
				</DialogHeader>

				<div className="py-4">
					<p className="text-sm text-gray-600">
						{tc("delete")} <strong>{roleName}</strong>?
					</p>
					<p className="text-[12px] text-red-500 mt-2 italic">
						* {tc("cancel")}
					</p>
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isPending}
						className="flex-1"
					>
						{tc("cancel")}
					</Button>
					<Button
						onClick={handleDelete}
						disabled={isPending}
						className="flex-1 bg-red-600 hover:bg-red-700 text-white"
					>
						{isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							tc("yes")
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteRole;
