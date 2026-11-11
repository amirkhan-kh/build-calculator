"use client";

import { useFirms } from "@/action/hooks/firms-hook/get-firms";
import { useUpdateFirm } from "@/action/hooks/firms-hook/update-firm";
import { ModalAddFirm } from "@/components/shared/ui-demo/modals/firm-modal/modal-add-firm/_modal-add-firm";
import { ModalEditFirm } from "@/components/shared/ui-demo/modals/firm-modal/modal-edit-firm/_modal-edit-firm";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/kit/page-header";
import { FilterBar } from "@/components/shared/kit/filter-bar";
import { SearchInput } from "@/components/shared/kit/search-input";
import { Segmented } from "@/components/shared/kit/segmented";
import { EmptyState, LoadingState } from "@/components/shared/kit/empty-state";
import { monogram } from "@/components/shared/ui-demo/cards/_complex-card";
import type { FirmStatusFilter } from "@/types/firm.types";
import { Briefcase, Check, CircleCheck, CircleOff, Copy, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

function CopyValue({ value, secret }: { value: string; secret?: boolean }) {
	const [shown, setShown] = useState(!secret);
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 1200);
		} catch {
			/* clipboard unavailable */
		}
	};

	return (
		<div className="group/copy inline-flex max-w-full items-center gap-1 rounded-md bg-slate-100/80 py-0.5 pl-2 pr-0.5">
			<code className="truncate font-mono text-[12.5px] text-slate-700">
				{shown ? value : "••••••••"}
			</code>
			{secret && (
				<button
					type="button"
					onClick={() => setShown((s) => !s)}
					className="grid size-6 shrink-0 place-items-center rounded text-slate-400 hover:bg-white hover:text-slate-700"
				>
					{shown ? <EyeOff size={13} /> : <Eye size={13} />}
				</button>
			)}
			<button
				type="button"
				onClick={copy}
				className="grid size-6 shrink-0 place-items-center rounded text-slate-400 hover:bg-white hover:text-slate-700"
			>
				{copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
			</button>
		</div>
	);
}

export function FirmsAdmin() {
	const t = useTranslations("firms");
	const [nameQuery, setNameQuery] = useState("");
	const [status, setStatus] = useState<FirmStatusFilter>("all");
	const [pendingId, setPendingId] = useState<number | null>(null);
	const { mutateAsync: updateFirm } = useUpdateFirm();

	const apiParams = useMemo(() => {
		const params: { name__ilike?: string; is_active?: boolean } = {};
		if (nameQuery.trim()) params.name__ilike = nameQuery.trim();
		if (status === "active") params.is_active = true;
		if (status === "inactive") params.is_active = false;
		return params;
	}, [nameQuery, status]);

	const { data: firms = [], isLoading } = useFirms(apiParams);
	const { data: allFirms = [] } = useFirms({});
	const activeCount = allFirms.filter((f) => f.is_active).length;

	const handleToggle = async (id: number, isActive: boolean) => {
		setPendingId(id);
		try {
			await updateFirm({ id, data: { is_active: !isActive } });
			toast.success(isActive ? t("deactivated") : t("activated"));
		} catch {
			/* surfaced by useUpdateFirm */
		} finally {
			setPendingId(null);
		}
	};

	const stats = [
		{ icon: Briefcase, label: t("count_label"), value: allFirms.length, tone: "text-ink bg-indigo-50" },
		{ icon: CircleCheck, label: t("filter_active"), value: activeCount, tone: "text-emerald-600 bg-emerald-50" },
		{ icon: CircleOff, label: t("filter_inactive"), value: allFirms.length - activeCount, tone: "text-slate-500 bg-slate-100" },
	];

	return (
		<section>
			<PageHeader
				title={t("title")}
				description={t("subtitle")}
				actions={<ModalAddFirm />}
			/>

			<div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
				{stats.map(({ icon: Icon, label, value, tone }) => (
					<div key={label} className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5">
						<span className={cn("grid size-10 place-items-center rounded-xl", tone)}>
							<Icon size={18} />
						</span>
						<div>
							<p className="text-xs text-slate-500">{label}</p>
							<p className="text-xl font-semibold tabular-nums text-slate-900">{value}</p>
						</div>
					</div>
				))}
			</div>

			<FilterBar>
				<SearchInput
					value={nameQuery}
					onChange={setNameQuery}
					debounce={300}
					placeholder={t("filter_name")}
					className="w-full sm:w-72"
				/>
				<Segmented
					value={status}
					onChange={setStatus}
					options={[
						{ value: "all", label: t("filter_all") },
						{ value: "active", label: t("filter_active") },
						{ value: "inactive", label: t("filter_inactive") },
					]}
				/>
			</FilterBar>

			{isLoading ? (
				<LoadingState />
			) : firms.length === 0 ? (
				<EmptyState icon={Briefcase} title={t("empty")} />
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">#</TableHead>
							<TableHead>{t("col_name")}</TableHead>
							<TableHead>{t("col_login")}</TableHead>
							<TableHead>{t("col_password")}</TableHead>
							<TableHead>{t("col_status")}</TableHead>
							<TableHead className="w-24" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{firms.map((firm, index) => (
							<TableRow key={firm.id} className={cn(!firm.is_active && "bg-slate-50/50")}>
								<TableCell className="tabular-nums text-slate-400">{index + 1}</TableCell>
								<TableCell>
									<div className="flex items-center gap-3">
										<span
											className={cn(
												"grid size-9 shrink-0 place-items-center rounded-lg text-xs font-semibold",
												firm.is_active ? "bg-ink text-white" : "bg-slate-200 text-slate-500",
											)}
										>
											{monogram(firm.name)}
										</span>
										<span className={cn("font-medium", firm.is_active ? "text-slate-900" : "text-slate-500")}>
											{firm.name}
										</span>
									</div>
								</TableCell>
								<TableCell>
									<CopyValue value={firm.username} />
								</TableCell>
								<TableCell>
									<CopyValue value={firm.password} secret />
								</TableCell>
								<TableCell>
									<label className="inline-flex items-center gap-2.5">
										<Switch
											checked={firm.is_active}
											disabled={pendingId === firm.id}
											onCheckedChange={() => handleToggle(firm.id, firm.is_active)}
											aria-label={firm.is_active ? t("make_inactive") : t("make_active")}
											title={firm.is_active ? t("make_inactive") : t("make_active")}
										/>
										<span
											className={cn(
												"text-xs font-medium",
												firm.is_active ? "text-emerald-700" : "text-slate-500",
											)}
										>
											{firm.is_active ? t("status_active") : t("status_inactive")}
										</span>
									</label>
								</TableCell>
								<TableCell>
									<div className="flex justify-end">
										<ModalEditFirm firm={firm} />
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</section>
	);
}
