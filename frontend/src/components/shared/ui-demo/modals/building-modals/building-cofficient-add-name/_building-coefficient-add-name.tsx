"use client";

import { useCreateCoefficient } from "@/action/hooks/coefficient-hook/create-coefficient";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shared/kit/field";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ModalAddedCoefficientNameProps {
	onSuccess?: () => void;
	buildingId: string | number;
}

export const ModalAddedCoefficientName = ({
	onSuccess,
	buildingId,
}: ModalAddedCoefficientNameProps) => {
	const [coefficientName, setCoefficientName] = useState("");
	const [open, setOpen] = useState(false);
	const { mutate: createMutation, isPending } = useCreateCoefficient();
	const t = useTranslations("coefficient");
	const tc = useTranslations("common");

	const handleCreateCoefficient = (e?: React.FormEvent) => {
		e?.preventDefault();
		const trimmedName = coefficientName.trim();
		if (!trimmedName) {
			toast.error(t("enter_name_error"));
			return;
		}
		createMutation(
			{
				name: trimmedName,
				building_id: Number(buildingId),
			},
			{
				onSuccess: () => {
					toast.success(t("created_success"));
					setCoefficientName("");
					setOpen(false);
					if (onSuccess) onSuccess();
				},
				onError: (error) => {
					toast.error(t("create_error"));
					console.error(error);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					{t("add_name_btn")}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>{t("add_name_title")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleCreateCoefficient} className="flex flex-col gap-4">
					<Field label={t("name_label")} htmlFor="coef-group-name" required>
						<Input
							id="coef-group-name"
							value={coefficientName}
							onChange={(e) => setCoefficientName(e.target.value)}
							placeholder={t("name_placeholder")}
							disabled={isPending}
							autoFocus
						/>
					</Field>
					<DialogFooter className="pt-1">
						<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
							{tc("cancel")}
						</Button>
						<Button type="submit" disabled={isPending || !coefficientName.trim()}>
							{isPending && <Loader2 className="animate-spin" />}
							{isPending ? tc("creating") : tc("create")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
