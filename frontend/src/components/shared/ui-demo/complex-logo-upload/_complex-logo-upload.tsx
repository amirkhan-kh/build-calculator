"use client";

import Image from "next/image";
import { useRef } from "react";
import { UploadCloud } from "lucide-react";
import { useUploadComplexLogo } from "@/action/hooks/complex-hook/upload-logo";
import { IMAGE_ACCEPT, validateImageFile } from "@/lib/image-file.util";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface Props {
	complexId: number;
	logoUrl: string | null;
}

export default function ComplexLogoUpload({ complexId, logoUrl }: Props) {
	const inputRef = useRef<HTMLInputElement>(null);
	const { mutate, isPending } = useUploadComplexLogo();
	const router = useRouter();
	const t = useTranslations("complex");
	const tc = useTranslations("common");

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const errorKey = validateImageFile(file);
		if (errorKey) {
			toast.error(t(errorKey));
			e.target.value = "";
			return;
		}
		mutate(
			{ id: complexId, file },
			{ onSuccess: () => router.refresh() },
		);
	};

	return (
		<div className="relative group w-24 h-24 shrink-0">
			<div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-indigo-200 bg-white shadow-sm flex items-center justify-center">
				{logoUrl ? (
					<Image
						src={logoUrl}
						alt={t("logo_alt")}
						fill
						unoptimized
						className="object-contain"
					/>
				) : (
					<span className="text-indigo-300 text-xs text-center px-1">
						{t("no_logo")}
					</span>
				)}
			</div>

			<button
				type="button"
				disabled={isPending}
				onClick={() => inputRef.current?.click()}
				className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:cursor-wait"
				title={tc("upload")}
			>
				<UploadCloud size={24} className="text-white" />
			</button>

			<input
				ref={inputRef}
				type="file"
				accept={IMAGE_ACCEPT}
				className="hidden"
				onChange={handleFileChange}
			/>
		</div>
	);
}
