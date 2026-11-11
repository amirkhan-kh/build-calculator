"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: ReactNode;
	description?: ReactNode;
	onConfirm: () => void | Promise<void>;
	pending?: boolean;
	confirmLabel?: ReactNode;
	pendingLabel?: ReactNode;
	trigger?: ReactNode;
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	onConfirm,
	pending = false,
	confirmLabel,
	pendingLabel,
	trigger,
}: ConfirmDialogProps) {
	const tc = useTranslations("common");

	return (
		<Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent className="max-w-[420px] gap-0 p-0">
				<div className="flex gap-4 p-6 pb-5">
					<div className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-50/50">
						<AlertTriangle size={18} />
					</div>
					<div className="min-w-0 pt-0.5">
						<DialogTitle>{title}</DialogTitle>
						{description && (
							<DialogDescription className="mt-1.5">{description}</DialogDescription>
						)}
					</div>
				</div>
				<div className="flex flex-col-reverse gap-2 rounded-b-2xl border-t border-slate-200/70 bg-slate-50/70 px-6 py-3.5 sm:flex-row sm:justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={pending}
					>
						{tc("cancel")}
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={() => onConfirm()}
						disabled={pending}
					>
						{pending && <Loader2 className="animate-spin" />}
						{pending ? (pendingLabel ?? tc("deleting")) : (confirmLabel ?? tc("delete"))}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export const deleteTriggerClass =
	"grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50";
