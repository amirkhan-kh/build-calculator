"use client";

import { useUpdateFirm } from "@/action/hooks/firms-hook/update-firm";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IFirm } from "@/types/firm.types";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function ModalEditFirm({
	firm,
	onSuccess,
}: {
	firm: IFirm;
	onSuccess?: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [username, setUsername] = useState(firm.username);
	const [password, setPassword] = useState(firm.password);
	const t = useTranslations("firms");
	const tc = useTranslations("common");
	const { mutateAsync, isPending } = useUpdateFirm();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!username.trim() || !password.trim()) {
			toast.error(t("required_error"));
			return;
		}
		try {
			await mutateAsync({
				id: firm.id,
				data: { username: username.trim(), password },
			});
			toast.success(t("updated_success"));
			setOpen(false);
			onSuccess?.();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t("update_error"));
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (next) {
					setUsername(firm.username);
					setPassword(firm.password);
				}
			}}
		>
			<DialogTrigger asChild>
				<button className="bg-gradient-to-br from-indigo-100 to-white px-2 py-1 rounded-[3px] leading-5 text-sm">
					{tc("change")}
				</button>
			</DialogTrigger>
			<DialogContent className="max-w-96">
				<DialogHeader>
					<DialogTitle>{t("edit_title")}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					<p className="text-sm text-gray-500">
						{t("name_label")}: <span className="font-medium text-gray-800">{firm.name}</span>
					</p>
					<div className="space-y-2">
						<label className="text-sm font-medium">{t("login_label")} *</label>
						<Input
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							disabled={isPending}
							required
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">{t("password_label")} *</label>
						<Input
							type="text"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={isPending}
							required
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isPending}
						>
							{tc("cancel")}
						</Button>
						<Button
							type="submit"
							disabled={isPending}
							className="bg-[#282964] hover:bg-[#1f2050]"
						>
							{isPending ? tc("saving") : tc("save")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
