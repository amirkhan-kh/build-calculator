"use client";

import React, { useState, useMemo, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useComplexes } from "@/action/hooks/complex-hook/get-complexes";
import { useBuildings } from "@/action/hooks/buildings-hook/get-buildings";
import { toast } from "sonner";
import {
	ChevronRight,
	RefreshCcw,
	FileUp,
	Download,
	AlertTriangle,
	Upload,
} from "lucide-react";
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

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<button className="flex items-center gap-2 rounded-sm bg-[#282964] px-4 py-1.5 text-sm text-white transition-colors hover:bg-[#1f2050]">
					<Upload size={14} />
					{triggerLabel ?? t("trigger_label")}
				</button>
			</DialogTrigger>

			<DialogContent className="bg-white sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold text-gray-800">
						{t("import_title")}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-5 py-4">
					{!isPreset && (
						<>
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-700">
									{t("complex_label")}
								</label>
								<select
									value={selectedComplexId}
									onChange={(e) => {
										setSelectedComplexId(e.target.value);
										setSelectedBuildingId("");
									}}
									className="w-full rounded-sm border border-gray-300 bg-white p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
									required
									disabled={isComplexesLoading || uploadMutation.isPending}
								>
									<option value="">
										{isComplexesLoading ? t("select_complex_loading") : t("select_complex_placeholder")}
									</option>
									{complexes.map((c) => (
										<option key={c.id} value={c.id}>
											{c.name}
										</option>
									))}
								</select>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-700">
									{t("building_label")}
								</label>
								<select
									value={selectedBuildingId}
									onChange={(e) => setSelectedBuildingId(e.target.value)}
									className="w-full rounded-sm border border-gray-300 bg-white p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
									disabled={
										!selectedComplexId ||
										isBuildingsLoading ||
										uploadMutation.isPending
									}
									required
								>
									<option value="">{t("select_building")}</option>
									{filteredBuildings.map((b) => (
										<option key={b.id} value={b.id}>
											{b.name}
										</option>
									))}
								</select>
							</div>
						</>
					)}

					{activeBuildingId && (
						<div className="flex items-center justify-between rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-3">
							<div>
								<p className="text-xs font-semibold text-indigo-700">
									{t("template_title")}
								</p>
								<p className="text-[11px] text-indigo-400">
									{t("template_hint")}
								</p>
							</div>
							<button
								type="button"
								onClick={handleDownloadTemplate}
								disabled={isDownloading || uploadMutation.isPending}
								className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
							>
								<Download size={13} />
								{isDownloading ? tc("downloading") : tc("download")}
							</button>
						</div>
					)}

					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							{t("file_label")}
						</label>
						<div className="relative">
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
								disabled={uploadMutation.isPending}
							/>
							<label
								htmlFor="excel-upload"
								className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border-2 border-dashed border-gray-300 p-3 transition-all hover:border-indigo-400 hover:bg-indigo-50"
							>
								<FileUp size={20} className="text-gray-400" />
								<span className="truncate text-sm text-gray-600">
									{file ? file.name : t("select_file")}
								</span>
							</label>
						</div>
					</div>

					{rowErrors.length > 0 && (
						<div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
							<div className="mb-2 flex items-center gap-2">
								<AlertTriangle size={15} className="text-amber-500" />
								<p className="text-sm font-semibold text-amber-700">
									{t("rows_failed", { count: rowErrors.length })}
								</p>
							</div>
							<ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-amber-600">
								{rowErrors.map((err, i) => (
									<li key={i} className="border-b border-amber-100 pb-1">
										{err}
									</li>
								))}
							</ul>
							<p className="mt-2 text-[11px] text-amber-500">
								{t("rest_added")}
							</p>
						</div>
					)}

					<div className="flex gap-3 border-t pt-4">
						<button
							type="submit"
							disabled={uploadMutation.isPending}
							className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-[#400189] to-[#46479f] py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
						>
							{uploadMutation.isPending ? tc("uploading") : tc("upload")}{" "}
							<ChevronRight size={18} />
						</button>

						<button
							type="button"
							onClick={resetForm}
							disabled={uploadMutation.isPending}
							className="rounded-sm border border-gray-300 px-4 text-gray-600 transition-colors hover:bg-gray-50"
						>
							<RefreshCcw size={18} />
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default ModaDataSendingForExel;
