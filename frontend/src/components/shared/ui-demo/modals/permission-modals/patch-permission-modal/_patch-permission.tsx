"use client";

import React, { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { IPermission } from "@/types/permissions.types";
import { usePatchPermission } from "@/action/hooks/permissions-hook/use-patch-permission-hook";
import { FiEdit3 } from "react-icons/fi";

interface Props {
	permission: IPermission;
}

const PatchPermissionManagement: React.FC<Props> = ({ permission }) => {
	const [open, setOpen] = useState<boolean>(false);
	const [codename, setCodename] = useState<string>(permission.codename);

	const { mutate: updatePermission, isPending } = usePatchPermission();
	const t = useTranslations("management");
	const tc = useTranslations("common");

	useEffect(() => {
		if (open) {
			setCodename(permission.codename);
		}
	}, [open, permission.codename]);

	const handleUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!codename.trim() || codename === permission.codename) return;

		updatePermission(
			{
				id: permission.id,
				data: { codename: codename.trim().toLowerCase().replace(/\s+/g, "_") },
			},
			{
				onSuccess: (res) => {
					if (!res._meta) {
						setOpen(false);
					}
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button className="text-gray-200 hover:text-white bg-indigo-900 px-3 rounded-[3px]">
					<FiEdit3 />
				</button>
			</DialogTrigger>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{t("patch_permission_title")}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleUpdate} className="space-y-4 py-2">
					<div className="space-y-2">
						<label className="text-[11px] font-semibold text-gray-400 uppercase">
							{t("patch_codename_label")}
						</label>
						<Input
							required
							value={codename}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setCodename(e.target.value)
							}
							disabled={isPending}
							placeholder={t("patch_permission_placeholder")}
							className="lowercase"
						/>
					</div>

					<DialogFooter className="pt-2 space-x-2.5">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isPending}
							className="flex-1 text-xs"
						>
							{tc("cancel")}
						</Button>
						<Button
							type="submit"
							disabled={
								isPending ||
								!codename.trim() ||
								codename === permission.codename
							}
							className="flex-1 bg-indigo-900 hover:bg-indigo-800 text-white text-xs"
						>
							{isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								tc("update")
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default PatchPermissionManagement;
