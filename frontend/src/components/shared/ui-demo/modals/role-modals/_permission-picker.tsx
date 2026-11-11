"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/cn";
import type { IPermission } from "@/types/permissions.types";

interface Props {
	permissions: IPermission[] | undefined;
	loading: boolean;
	selected: number[];
	onChange: (ids: number[]) => void;
}

export function PermissionPicker({ permissions = [], loading, selected, onChange }: Props) {
	const t = useTranslations("management");
	const allSelected = permissions.length > 0 && selected.length === permissions.length;

	const toggle = (id: number, checked: boolean) =>
		onChange(checked ? [...selected, id] : selected.filter((x) => x !== id));

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<span className="text-[13px] font-medium text-slate-700">{t("permissions_label")}</span>
				<span className="text-xs tabular-nums text-slate-500">
					{t("selected_of_total", { count: selected.length, total: permissions.length })}
				</span>
			</div>
			<div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
				{loading ? (
					<div className="flex justify-center p-6">
						<Loader2 className="size-5 animate-spin text-slate-400" />
					</div>
				) : (
					<>
						{permissions.length > 0 && (
							<label className="flex cursor-pointer items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-600 select-none">
								<Checkbox
									checked={allSelected}
									onCheckedChange={(c) => onChange(c === true ? permissions.map((p) => p.id) : [])}
								/>
								{t("select_all")}
							</label>
						)}
						<div className="max-h-56 overflow-y-auto scrollbar-thin p-1">
							{permissions.map((perm) => {
								const checked = selected.includes(perm.id);
								return (
									<label
										key={perm.id}
										className={cn(
											"flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors select-none hover:bg-slate-50",
											checked && "bg-indigo-50/60",
										)}
									>
										<Checkbox checked={checked} onCheckedChange={(c) => toggle(perm.id, c === true)} />
										<code className="truncate font-mono text-[12.5px] text-slate-700">{perm.codename}</code>
									</label>
								);
							})}
							{permissions.length === 0 && (
								<p className="p-4 text-center text-sm text-slate-400">{t("no_permissions")}</p>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
