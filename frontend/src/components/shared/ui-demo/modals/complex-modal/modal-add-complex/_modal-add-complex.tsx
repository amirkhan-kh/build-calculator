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
import { IMAGE_ACCEPT, validateImageFile } from "@/lib/image-file.util";
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

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
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
						<label htmlFor="name" className="text-sm font-medium">
							{t("name_label")} *
						</label>
						<Input
							id="name"
							name="name"
							type="text"
							placeholder={t("name_placeholder")}
							value={formData.name}
							onChange={handleChange}
							required
							disabled={loading}
							className="w-full"
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="description" className="text-sm font-medium">
							{tc("description")}
						</label>
						<Input
							id="description"
							name="description"
							type="text"
							placeholder={tc("description")}
							value={formData.description}
							onChange={handleChange}
							disabled={loading}
							className="w-full"
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="logo" className="text-sm font-medium">
							{t("logo_label")}{" "}
							<span className="text-gray-400 font-normal">
								({t("logo_optional")})
							</span>
						</label>
						{logoPreview && (
							<div className="w-20 h-20 rounded-xl overflow-hidden border border-indigo-200 bg-white flex items-center justify-center">
								{/* local preview only — file is uploaded to backend on submit */}
								<img
									src={logoPreview}
									alt={t("logo_alt")}
									className="max-w-full max-h-full object-contain"
								/>
							</div>
						)}
						<Input
							id="logo"
							ref={fileInputRef}
							name="logo"
							type="file"
							accept={IMAGE_ACCEPT}
							onChange={handleLogoChange}
							disabled={loading}
							className="w-full"
						/>
						<p className="text-xs text-gray-400">{t("logo_hint")}</p>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={loading}
							className="mr-2"
						>
							{tc("cancel")}
						</Button>
						<Button
							type="submit"
							disabled={loading || !formData.name.trim()}
							className="bg-[#282964] hover:bg-[#1f2050]"
						>
							{loading ? tc("adding") : tc("add")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
