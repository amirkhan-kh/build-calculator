"use client";

import { useCreateComplex } from "@/action/hooks/complex-hook/create-complex";
import { uploadComplexLogo } from "@/action/complex/upload-complex-logo.api";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
	DialogHeader,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { validateImageFile } from "@/lib/image-file.util";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/kit/field";
import { ImagePicker } from "@/components/shared/kit/image-picker";
import { Loader2, Plus } from "lucide-react";
import { ModalPropsModalAddedComplex } from "@/types/props.types";
import { FC, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export const ModalAddedComplex: FC<ModalPropsModalAddedComplex> = ({
	onSuccess,
}) => {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({ name: "", description: "" });
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const t = useTranslations("complex");
	const tc = useTranslations("common");

	const { mutateAsync: createComplex } = useCreateComplex();

	const resetForm = () => {
		setFormData({ name: "", description: "" });
		setLogoFile(null);
		if (logoPreview) URL.revokeObjectURL(logoPreview);
		setLogoPreview(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) resetForm();
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			setLogoFile(null);
			if (logoPreview) URL.revokeObjectURL(logoPreview);
			setLogoPreview(null);
			return;
		}

		const errorKey = validateImageFile(file);
		if (errorKey) {
			toast.error(t(errorKey));
			e.target.value = "";
			return;
		}

		if (logoPreview) URL.revokeObjectURL(logoPreview);
		setLogoFile(file);
		setLogoPreview(URL.createObjectURL(file));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			toast.error(t("name_error"));
			return;
		}

		if (logoFile) {
			const errorKey = validateImageFile(logoFile);
			if (errorKey) {
				toast.error(t(errorKey));
				return;
			}
		}

		setLoading(true);
		try {
			const created = await createComplex({
				name: formData.name,
				description: formData.description || "",
			});

			if (logoFile) {
				const uploadRes = await uploadComplexLogo(created.id, logoFile);
				if (uploadRes._meta?.error || !uploadRes.data) {
					toast.error(uploadRes._meta?.error || t("logo_upload_error"));
				}
			}

			resetForm();
			setOpen(false);

			toast.success(t("added_success"));

			if (onSuccess) await onSuccess();
		} catch (error) {
			console.error("complex add error:", error);
			toast.error(error instanceof Error ? error.message : t("add_error"));
		} finally {
			setLoading(false);
		}
	};

	const clearLogo = () => {
		setLogoFile(null);
		if (logoPreview) URL.revokeObjectURL(logoPreview);
		setLogoPreview(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					{t("add_btn")}
				</Button>
			</DialogTrigger>

			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{t("add_title")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<Field label={t("name_label")} htmlFor="name" required>
						<Input
							id="name"
							name="name"
							type="text"
							placeholder={t("name_placeholder")}
							value={formData.name}
							onChange={handleChange}
							required
							disabled={loading}
							autoFocus
						/>
					</Field>

					<Field label={tc("description")} htmlFor="description">
						<Textarea
							id="description"
							name="description"
							rows={3}
							placeholder={tc("description")}
							value={formData.description}
							onChange={handleChange}
							disabled={loading}
						/>
					</Field>

					<Field label={<>{t("logo_label")} <span className="font-normal text-slate-400">({t("logo_optional")})</span></>}>
						<ImagePicker
							id="complex-logo"
							ref={fileInputRef}
							previewUrl={logoPreview}
							fileName={logoFile?.name}
							onChange={handleLogoChange}
							onClear={clearLogo}
							disabled={loading}
							title={tc("select_file")}
							hint={t("logo_hint")}
						/>
					</Field>

					<DialogFooter className="pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={loading}
						>
							{tc("cancel")}
						</Button>
						<Button type="submit" disabled={loading || !formData.name.trim()}>
							{loading && <Loader2 className="animate-spin" />}
							{loading ? tc("adding") : tc("add")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
