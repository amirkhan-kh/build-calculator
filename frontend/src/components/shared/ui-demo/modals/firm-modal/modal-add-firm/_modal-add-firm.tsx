"use client";

import { useCreateFirm } from "@/action/hooks/firms-hook/create-firm";
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
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function ModalAddFirm({ onSuccess }: { onSuccess?: () => void }) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const t = useTranslations("firms");
	const tc = useTranslations("common");
	const { mutateAsync, isPending } = useCreateFirm();

	const reset = () => {
		setName("");
		setUsername("");
		setPassword("");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !username.trim() || !password.trim()) {
			toast.error(t("required_error"));
			return;
		}
		try {
			await mutateAsync({
				name: name.trim(),
				username: username.trim(),
				password,
			});
			toast.success(t("added_success"));
			reset();
			setOpen(false);
			onSuccess?.();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t("add_error"));
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) reset();
			}}
		>
			<DialogTrigger asChild>
				<button className="bg-[#282964] px-2 py-1 rounded-[3px] leading-5 text-white text-sm hover:bg-[#1f2050] transition-colors">
					{t("add_btn")}
				</button>
			</DialogTrigger>
			<DialogContent className="max-w-96">
				<DialogHeader>
					<DialogTitle>{t("add_title")}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">{t("name_label")} *</label>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t("name_placeholder")}
							disabled={isPending}
							required
						/>
						<p className="text-xs text-gray-400">{t("name_hint")}</p>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">{t("login_label")} *</label>
						<Input
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder={t("login_placeholder")}
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
							placeholder={t("password_placeholder")}
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
							{isPending ? tc("adding") : tc("add")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
