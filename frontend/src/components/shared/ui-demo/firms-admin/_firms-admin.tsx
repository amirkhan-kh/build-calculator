"use client";

import { useFirms } from "@/action/hooks/firms-hook/get-firms";
import { useUpdateFirm } from "@/action/hooks/firms-hook/update-firm";
import { ModalAddFirm } from "@/components/shared/ui-demo/modals/firm-modal/modal-add-firm/_modal-add-firm";
import { ModalEditFirm } from "@/components/shared/ui-demo/modals/firm-modal/modal-edit-firm/_modal-edit-firm";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { FirmStatusFilter } from "@/types/firm.types";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function FirmsAdmin() {
	const t = useTranslations("firms");
	const [nameQuery, setNameQuery] = useState("");
	const [status, setStatus] = useState<FirmStatusFilter>("all");
	const { mutateAsync: updateFirm, isPending: isUpdating } = useUpdateFirm();

	const apiParams = useMemo(() => {
		const params: { name__ilike?: string; is_active?: boolean } = {};
		if (nameQuery.trim()) params.name__ilike = nameQuery.trim();
		if (status === "active") params.is_active = true;
		if (status === "inactive") params.is_active = false;
		return params;
	}, [nameQuery, status]);

	const { data: firms = [], isLoading, refetch } = useFirms(apiParams);

	const handleToggle = async (id: number, isActive: boolean) => {
		try {
			await updateFirm({ id, data: { is_active: !isActive } });
			toast.success(isActive ? t("deactivated") : t("activated"));
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t("update_error"));
		}
	};

	return (
		<section>
			<div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-black text-gray-900">{t("title")}</h1>
					<p className="mt-1 text-sm text-gray-400">{t("subtitle")}</p>
				</div>
				<div className="flex items-center gap-3">
					<span className="text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5">
						{t("count_label")}: {firms.length}
					</span>
					<ModalAddFirm onSuccess={() => refetch()} />
				</div>
			</div>

			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
				<Input
					value={nameQuery}
					onChange={(e) => setNameQuery(e.target.value)}
					placeholder={t("filter_name")}
					className="sm:max-w-64"
				/>
				<div className="flex gap-2">
					{(
						[
							["all", t("filter_all")],
							["active", t("filter_active")],
							["inactive", t("filter_inactive")],
						] as const
					).map(([value, label]) => (
						<button
							key={value}
							type="button"
							onClick={() => setStatus(value)}
							className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
								status === value
									? "bg-indigo-600 text-white"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							}`}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			{isLoading ? (
				<Loader2 className="animate-spin m-10" />
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-14">#</TableHead>
							<TableHead>{t("col_name")}</TableHead>
							<TableHead>{t("col_login")}</TableHead>
							<TableHead>{t("col_password")}</TableHead>
							<TableHead>{t("col_status")}</TableHead>
							<TableHead className="text-right">{t("col_action")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{firms.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center text-gray-400 py-8">
									{t("empty")}
								</TableCell>
							</TableRow>
						) : (
							firms.map((firm, index) => (
								<TableRow key={firm.id}>
									<TableCell>{index + 1}</TableCell>
									<TableCell className="font-medium">{firm.name}</TableCell>
									<TableCell>{firm.username}</TableCell>
									<TableCell className="font-mono text-xs">{firm.password}</TableCell>
									<TableCell>
										<span
											className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
												firm.is_active
													? "bg-green-50 text-green-700 border border-green-200"
													: "bg-gray-100 text-gray-500 border border-gray-200"
											}`}
										>
											{firm.is_active ? t("status_active") : t("status_inactive")}
										</span>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<ModalEditFirm firm={firm} onSuccess={() => refetch()} />
											<button
												type="button"
												disabled={isUpdating}
												onClick={() => handleToggle(firm.id, firm.is_active)}
												className="px-2 py-1 rounded-[3px] text-xs border border-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
											>
												{firm.is_active ? t("make_inactive") : t("make_active")}
											</button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			)}
		</section>
	);
}
