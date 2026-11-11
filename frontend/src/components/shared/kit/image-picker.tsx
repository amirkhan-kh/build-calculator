"use client";

import { forwardRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { IMAGE_ACCEPT } from "@/lib/image-file.util";

interface ImagePickerProps {
	id: string;
	previewUrl: string | null;
	fileName?: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onClear?: () => void;
	disabled?: boolean;
	title: string;
	hint?: string;
}

export const ImagePicker = forwardRef<HTMLInputElement, ImagePickerProps>(
	({ id, previewUrl, fileName, onChange, onClear, disabled, title, hint }, ref) => (
		<div className="flex items-center gap-3">
			<label
				htmlFor={id}
				className={cn(
					"group relative grid size-16 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed transition-colors",
					previewUrl
						? "border-slate-200 bg-white"
						: "border-slate-300 bg-slate-50 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-500",
					disabled && "pointer-events-none opacity-60",
				)}
			>
				{previewUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={previewUrl} alt="" className="size-full object-contain p-1.5" />
				) : (
					<ImagePlus size={20} strokeWidth={1.75} />
				)}
			</label>
			<div className="min-w-0 flex-1">
				<label
					htmlFor={id}
					className="cursor-pointer text-[13px] font-medium text-ink hover:underline"
				>
					{fileName || title}
				</label>
				{hint && <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-slate-400">{hint}</p>}
			</div>
			{previewUrl && onClear && (
				<button
					type="button"
					onClick={onClear}
					disabled={disabled}
					className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
					aria-label="Remove"
				>
					<X size={15} />
				</button>
			)}
			<input
				ref={ref}
				id={id}
				type="file"
				accept={IMAGE_ACCEPT}
				onChange={onChange}
				disabled={disabled}
				className="sr-only"
			/>
		</div>
	),
);
ImagePicker.displayName = "ImagePicker";
