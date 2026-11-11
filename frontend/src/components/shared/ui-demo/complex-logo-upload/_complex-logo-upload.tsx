"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2 } from "lucide-react";
import { useUploadComplexLogo } from "@/action/hooks/complex-hook/upload-logo";
import { IMAGE_ACCEPT, validateImageFile } from "@/lib/image-file.util";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

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
	const [preview, setPreview] = useState<string | null>(null);
	const [previewFor, setPreviewFor] = useState(logoUrl);
	if (previewFor !== logoUrl) {
		setPreviewFor(logoUrl);
		setPreview(null);
	}

	useEffect(() => {
		return () => {
			if (preview) URL.revokeObjectURL(preview);
		};
	}, [preview]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		const errorKey = validateImageFile(file);
		if (errorKey) {
			toast.error(t(errorKey));
			return;
		}
		setPreview(URL.createObjectURL(file));
		mutate(
			{ id: complexId, file },
			{
				onSuccess: () => router.refresh(),
				onError: () => setPreview(null),
			},
		);
	};

	const src = preview ?? logoUrl;

	return (
		<>
			<button
				type="button"
				disabled={isPending}
				onClick={() => inputRef.current?.click()}
				title={tc("upload")}
				className={cn(
					"group relative size-20 shrink-0 overflow-hidden rounded-2xl border bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-wait",
					src
						? "border-slate-200 shadow-xs"
						: "border-dashed border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50",
				)}
			>
				{src ? (
					<Image
						src={src}
						alt={t("logo_alt")}
						fill
						unoptimized
						sizes="80px"
						className="object-contain p-2"
					/>
				) : (
					<span className="flex h-full flex-col items-center justify-center gap-1 px-1 text-slate-400 transition-colors group-hover:text-indigo-500">
						<ImagePlus size={20} strokeWidth={1.75} />
						<span className="text-[10px] font-medium leading-tight">{t("logo_label")}</span>
					</span>
				)}

				{src && !isPending && (
					<span className="absolute inset-0 grid place-items-center bg-slate-950/45 text-white opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
						<Camera size={20} />
					</span>
				)}

				{isPending && (
					<span className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-[2px]">
						<Loader2 size={20} className="animate-spin text-indigo-500" />
					</span>
				)}
			</button>
			<input
				ref={inputRef}
				type="file"
				accept={IMAGE_ACCEPT}
				className="hidden"
				onChange={handleFileChange}
			/>
		</>
	);
}
