"use client";

import { useUpdateFirm } from "@/action/hooks/firms-hook/update-firm";
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
import { IFirm } from "@/types/firm.types";
import { Loader2, Pencil, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { generatePassword } from "../modal-add-firm/_modal-add-firm";

export function ModalEditFirm({ firm, onSuccess }: { firm: IFirm; onSuccess?: () => void }) {
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
			await mutateAsync({ id: firm.id, data: { username: username.trim(), password } });
			toast.success(t("updated_success"));
			setOpen(false);
			onSuccess?.();
		} catch {
			/* surfaced by useUpdateFirm */
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
				<button
					type="button"
					className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
					title={tc("edit")}
					aria-label={tc("edit")}
				>
					<Pencil size={15} />
				</button>
			</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{t("edit_title")}</DialogTitle>
					<DialogDescription>{firm.name}</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Field label={t("login_label")} htmlFor={`firm-login-${firm.id}`} required>
							<Input
								id={`firm-login-${firm.id}`}
								autoComplete="off"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								disabled={isPending}
								className="font-mono"
								required
							/>
						</Field>
						<Field label={t("password_label")} htmlFor={`firm-password-${firm.id}`} required>
							<div className="relative">
								<Input
									id={`firm-password-${firm.id}`}
									autoComplete="off"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
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
							{isPending ? tc("saving") : tc("save")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
