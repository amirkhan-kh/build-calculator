"use client";

import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePostPermission } from "@/action/hooks/permissions-hook/use-post-permission-hook";
import { Field } from "@/components/shared/kit/field";

const CreatePermissionsManagement: React.FC = () => {
	const [open, setOpen] = useState(false);
	const [codename, setCodename] = useState("");
	const t = useTranslations("management");
	const tc = useTranslations("common");

	const { mutate: createPermission, isPending } = usePostPermission();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!codename.trim()) return;

		createPermission(
			{ codename: codename.trim().toLowerCase().replace(/\s+/g, "_") },
			{
				onSuccess: (res) => {
					if (!res._meta) {
						setOpen(false);
						setCodename("");
					}
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					{t("create_permission_btn")}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>{t("new_permission_title")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<Field
						label={t("system_name_label")}
						htmlFor="perm-codename"
						required
						hint={t("system_name_hint")}
					>
						<Input
							id="perm-codename"
							required
							autoFocus
							placeholder={t("system_name_placeholder")}
							value={codename}
							onChange={(e) => setCodename(e.target.value)}
							disabled={isPending}
							className="font-mono lowercase"
						/>
					</Field>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
							{tc("cancel")}
						</Button>
						<Button type="submit" disabled={isPending || !codename.trim()}>
							{isPending && <Loader2 className="animate-spin" />}
							{tc("create")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreatePermissionsManagement;
