"use client";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shared/kit/field";
import { Loader2, Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useUpdateComplex } from "@/action/hooks/complex-hook/update-complex";
import { IComplex } from "@/types/complex.types";

const ModalUpdateComplex = ({ complex }: { complex: IComplex }) => {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const [name, setName] = useState(complex.name);
	const [description, setDescription] = useState(complex.description || "");
	const t = useTranslations("complex");
	const tc = useTranslations("common");

	const { mutate, isPending } = useUpdateComplex();

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (next) {
			setName(complex.name);
			setDescription(complex.description || "");
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		mutate(
			{
				id: complex.id,
				data: {
					name,
					description,
				},
			},
			{
				onSuccess: () => {
					setOpen(false);
					router.refresh();
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Pencil />
					{tc("change")}
				</Button>
			</DialogTrigger>

			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{t("update_title")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<Field label={t("name_label")} htmlFor="complex-name" required>
						<Input
							id="complex-name"
							placeholder={t("name_placeholder")}
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</Field>

					<Field label={tc("description")} htmlFor="complex-description">
						<Textarea
							id="complex-description"
							rows={3}
							placeholder={tc("description")}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</Field>

					<DialogFooter className="pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isPending}
						>
							{tc("cancel")}
						</Button>
						<Button type="submit" disabled={isPending || !name.trim()}>
							{isPending && <Loader2 className="animate-spin" />}
							{isPending ? tc("saving") : tc("save")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default ModalUpdateComplex;
