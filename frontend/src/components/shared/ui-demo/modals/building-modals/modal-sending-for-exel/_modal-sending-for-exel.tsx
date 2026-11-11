"use client";

import React, { useState, useMemo, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useComplexes } from "@/action/hooks/complex-hook/get-complexes";
import { useBuildings } from "@/action/hooks/buildings-hook/get-buildings";
import { toast } from "sonner";
import {
	RefreshCcw,
	FileUp,
	FileSpreadsheet,
	Download,
	AlertTriangle,
	Loader2,
	Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/shared/kit/field";
import { cn } from "@/lib/cn";
import { useTranslations } from "next-intl";
import { useBulkCreateApartments } from "@/action/hooks/create-excel-hook/use-bulk-create-apartments";
import { downloadApartmentTemplate } from "@/action/create-excel/download-template.api";
import type { IComplex } from "@/types/complex.types";
import type { IBuildings } from "@/types/building.types";

interface Props {
	buildingId?: number;
	buildingName?: string;
	triggerLabel?: string;
}

const ModaDataSendingForExel = ({
	buildingId: presetBuildingId,
	buildingName,
	triggerLabel,
}: Props) => {
	const [open, setOpen] = useState(false);
	const [selectedComplexId, setSelectedComplexId] = useState<string>("");
	const [selectedBuildingId, setSelectedBuildingId] = useState<string>(
		presetBuildingId ? String(presetBuildingId) : "",
	);
	const [file, setFile] = useState<File | null>(null);
	const [rowErrors, setRowErrors] = useState<string[]>([]);
	const [isDownloading, setIsDownloading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const t = useTranslations("excel");
	const tc = useTranslations("common");

	const isPreset = Boolean(presetBuildingId);

	const { data: complexesData = [], isLoading: isComplexesLoading } = useComplexes();
	const { data: buildingsData = [], isLoading: isBuildingsLoading } = useBuildings({});
	const uploadMutation = useBulkCreateApartments();

	const complexes = (complexesData || []) as IComplex[];
	const buildings = (buildingsData || []) as IBuildings[];

	const filteredBuildings = useMemo(() => {
		if (!selectedComplexId) return [];
		return buildings.filter((b) => {
			const complexId =
				typeof b.complex_id === "object" && b.complex_id !== null
					? (b.complex_id as { id: number | string }).id
					: b.complex_id;
			return String(complexId) === String(selectedComplexId);
		});
	}, [buildings, selectedComplexId]);

	const activeBuildingId = isPreset ? String(presetBuildingId) : selectedBuildingId;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!activeBuildingId) return toast.error(t("select_building_error"));
		if (!file) return toast.error(t("select_file_error"));

		setRowErrors([]);

		uploadMutation.mutate(
			{ buildingId: activeBuildingId, file },
			{
				onSuccess: (res) => {
					if (res._meta?.error) return;

					if (res.data?.errors && res.data.errors.length > 0) {
						setRowErrors(res.data.errors);
					} else if (res.data) {
						setOpen(false);
						resetForm();
					}
				},
			},
		);
	};

	const handleDownloadTemplate = async () => {
		if (!activeBuildingId) {
			toast.error(t("select_building_first"));
			return;
		}
		setIsDownloading(true);
		try {
			await downloadApartmentTemplate(activeBuildingId, buildingName);
		} finally {
			setIsDownloading(false);
		}
	};

	const resetForm = () => {
		if (!isPreset) {
			setSelectedComplexId("");
			setSelectedBuildingId("");
		}
		setFile(null);
		setRowErrors([]);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleOpenChange = (val: boolean) => {
		setOpen(val);
		if (!val) resetForm();
	};

	const pending = uploadMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<Upload />
					{triggerLabel ?? t("trigger_label")}
				</Button>
			</DialogTrigger>

			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{t("import_title")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					{!isPreset && (
						<div className="grid gap-4 sm:grid-cols-2">
							<Field label={t("complex_label")} required>
								<Select
									value={selectedComplexId}
									onValueChange={(v) => {
										setSelectedComplexId(v);
										setSelectedBuildingId("");
									}}
									disabled={isComplexesLoading || pending}
								>
									<SelectTrigger>
										<SelectValue
											placeholder={isComplexesLoading ? t("select_complex_loading") : t("select_complex_placeholder")}
										/>
									</SelectTrigger>
									<SelectContent>
										{complexes.map((c) => (
											<SelectItem key={c.id} value={String(c.id)}>
												{c.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>

							<Field label={t("building_label")} required>
								<Select
									value={selectedBuildingId}
									onValueChange={setSelectedBuildingId}
									disabled={!selectedComplexId || isBuildingsLoading || pending}
								>
									<SelectTrigger>
										<SelectValue placeholder={t("select_building")} />
									</SelectTrigger>
									<SelectContent>
										{filteredBuildings.map((b) => (
											<SelectItem key={b.id} value={String(b.id)}>
												{b.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						</div>
					)}

					{activeBuildingId && (
						<div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
							<div className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
								<FileSpreadsheet size={18} />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-[13px] font-medium text-slate-800">{t("template_title")}</p>
								<p className="text-xs text-slate-500">{t("template_hint")}</p>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleDownloadTemplate}
								disabled={isDownloading || pending}
							>
								{isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
								{isDownloading ? tc("downloading") : tc("download")}
							</Button>
						</div>
					)}

					<Field label={t("file_label")} required>
						<input
							type="file"
							ref={fileInputRef}
							accept=".xls,.xlsx"
							onChange={(e) => {
								setFile(e.target.files?.[0] || null);
								setRowErrors([]);
							}}
							className="hidden"
							id="excel-upload"
							disabled={pending}
						/>
						<label
							htmlFor="excel-upload"
							className={cn(
								"flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
								file
									? "border-indigo-200 bg-indigo-50/40"
									: "border-slate-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/40",
							)}
						>
							<FileUp size={22} className={file ? "text-indigo-500" : "text-slate-400"} />
							<span className="max-w-full truncate text-[13px] font-medium text-slate-700">
								{file ? file.name : t("select_file")}
							</span>
							<span className="text-[11px] text-slate-400">.xls, .xlsx</span>
						</label>
					</Field>

					{rowErrors.length > 0 && (
						<div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5">
							<div className="mb-2 flex items-center gap-2">
								<AlertTriangle size={15} className="text-amber-600" />
								<p className="text-[13px] font-semibold text-amber-800">
									{t("rows_failed", { count: rowErrors.length })}
								</p>
							</div>
							<ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-amber-700 scrollbar-thin">
								{rowErrors.map((err, i) => (
									<li key={i} className="border-b border-amber-100 pb-1 last:border-0">
										{err}
									</li>
								))}
							</ul>
							<p className="mt-2 text-[11px] text-amber-600">{t("rest_added")}</p>
						</div>
					)}

					<DialogFooter className="pt-1">
						<Button type="button" variant="outline" onClick={resetForm} disabled={pending}>
							<RefreshCcw />
							{tc("reset")}
						</Button>
						<Button type="submit" disabled={pending || !file || !activeBuildingId}>
							{pending ? <Loader2 className="animate-spin" /> : <Upload />}
							{pending ? tc("uploading") : tc("upload")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default ModaDataSendingForExel;
