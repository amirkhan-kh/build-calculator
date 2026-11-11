"use client";

import { useCreateFirm } from "@/action/hooks/firms-hook/create-firm";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/kit/field";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function generatePassword(length = 10) {
	const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
	const values = crypto.getRandomValues(new Uint32Array(length));
	return Array.from(values, (v) => chars[v % chars.length]).join("");
}

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
			await mutateAsync({ name: name.trim(), username: username.trim(), password });
			toast.success(t("added_success"));
			reset();
			setOpen(false);
			onSuccess?.();
		} catch {
			/* surfaced by useCreateFirm */
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
				<Button>
					<Plus />
					{t("add_btn")}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{t("add_title")}</DialogTitle>
					<DialogDescription>{t("subtitle")}</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<Field label={t("name_label")} htmlFor="firm-name" required hint={t("name_hint")}>
						<Input
							id="firm-name"
							autoFocus
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t("name_placeholder")}
							disabled={isPending}
							required
						/>
					</Field>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Field label={t("login_label")} htmlFor="firm-login" required>
							<Input
								id="firm-login"
								autoComplete="off"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder={t("login_placeholder")}
								disabled={isPending}
								className="font-mono"
								required
							/>
						</Field>
						<Field label={t("password_label")} htmlFor="firm-password" required>
							<div className="relative">
								<Input
									id="firm-password"
									autoComplete="off"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder={t("password_placeholder")}
									disabled={isPending}
									className="pr-10 font-mono"
									required
								/>
								<button
									type="button"
									onClick={() => setPassword(generatePassword())}
									className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
									title={t("generate_password")}
									aria-label={t("generate_password")}
								>
									<RefreshCw size={14} />
								</button>
							</div>
						</Field>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
							{tc("cancel")}
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending && <Loader2 className="animate-spin" />}
							{isPending ? tc("adding") : tc("add")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
