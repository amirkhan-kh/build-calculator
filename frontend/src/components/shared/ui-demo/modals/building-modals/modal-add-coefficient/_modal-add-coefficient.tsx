"use client";
import { FC, useState } from "react";
import { Layers, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ModalAddedCoefficientName } from "../building-cofficient-add-name/_building-coefficient-add-name";
import { ModalAddedCoefficientType } from "../modal-coefficient-type-add/_modal-coefficient-type-add";
import { ModalEditCoefficientType } from "../../coefficient-type-modals/coefficient-type-update/_coefficient-type-delete";
import { ModalDeleteCoefficientType } from "../../coefficient-type-modals/coefficient-type-delete/_coefficient-type-delete";
import { useCoefficientTypesByBuildingId } from "@/action/hooks/coefficient-type-hook/get-coefficient-type";
import { useDeleteCoefficient } from "@/action/hooks/coefficient-hook/delete-coefficient";
import type { ICoefficientTypeGroup } from "@/types/coefficient-type.types";
import { PageHeader } from "@/components/shared/kit/page-header";
import { EmptyState, LoadingState } from "@/components/shared/kit/empty-state";
import { ConfirmDialog, deleteTriggerClass } from "@/components/shared/kit/confirm-dialog";

interface ModalAddedCoefficientProps {
	buildingId: number;
}

function DeleteGroupButton({ group, buildingId }: { group: ICoefficientTypeGroup; buildingId: number }) {
	const [open, setOpen] = useState(false);
	const deleteMutation = useDeleteCoefficient(buildingId);
	const t = useTranslations("coefficient");
	const tc = useTranslations("common");

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={setOpen}
			title={t("group_delete_title")}
			description={t("group_delete_confirm", { name: group.name })}
			pending={deleteMutation.isPending}
			onConfirm={() =>
				deleteMutation.mutate({ id: group.id }, { onSuccess: () => setOpen(false) })
			}
			trigger={
				<button type="button" className={deleteTriggerClass} aria-label={tc("delete")}>
					<Trash2 size={16} />
				</button>
			}
		/>
	);
}

export const ModalAddedCoefficient: FC<ModalAddedCoefficientProps> = ({ buildingId }) => {
	const coefRes = useCoefficientTypesByBuildingId(buildingId);
	const t = useTranslations("coefficient");

	const coefficientTypeGroups = Array.isArray(coefRes?.data)
		? (coefRes.data as ICoefficientTypeGroup[])
		: [];

	return (
		<section>
			<PageHeader
				as="h2"
				className="mb-4"
				title={t("section_title")}
				description={t("section_hint")}
				actions={<ModalAddedCoefficientName buildingId={buildingId} />}
			/>

			{coefRes.isLoading ? (
				<LoadingState className="min-h-40" />
			) : coefficientTypeGroups.length === 0 ? (
				<EmptyState icon={Layers} title={t("no_data")} />
			) : (
				<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
					{coefficientTypeGroups.map((group) => (
						<div key={group.id} className="surface overflow-hidden">
							<div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3">
								<div className="grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-500">
									<Layers size={16} />
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="truncate text-sm font-semibold text-slate-900">{group.name}</h3>
									<p className="text-xs text-slate-500">
										{t("types_count", { count: group.bcts.length })}
									</p>
								</div>
								<ModalAddedCoefficientType buildingId={buildingId} coefficientId={group.id} />
								<DeleteGroupButton group={group} buildingId={buildingId} />
							</div>

							{group.bcts.length === 0 ? (
								<p className="px-4 py-6 text-center text-[13px] text-slate-400">{t("no_types")}</p>
							) : (
								<ul className="divide-y divide-slate-100">
									{group.bcts.map((bct, index) => (
										<li key={bct.id} className="group/row flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50/70">
											<span className="w-5 shrink-0 text-xs font-medium tabular-nums text-slate-400">
												{index + 1}
											</span>
											<span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
												{bct.name}
											</span>
											<div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 sm:block">
												<div
													className="h-full rounded-full bg-indigo-400"
													style={{ width: `${Math.min(Math.abs(Number(bct.rate)), 100)}%` }}
												/>
											</div>
											<span className="w-14 text-right text-sm font-semibold tabular-nums text-slate-900">
												{bct.rate}%
											</span>
											<div className="flex items-center">
												<ModalEditCoefficientType
													coefficientType={bct}
													buildingId={buildingId}
													coefficientId={group.id}
												/>
												<ModalDeleteCoefficientType coefficientTypeId={bct.id} buildingId={buildingId} />
											</div>
										</li>
									))}
								</ul>
							)}
						</div>
					))}
				</div>
			)}
		</section>
	);
};
