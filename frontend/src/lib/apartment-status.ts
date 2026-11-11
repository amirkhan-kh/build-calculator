import type { TApartmentStatus } from "@/types/apartment.types";

export const APARTMENT_STATUSES: TApartmentStatus[] = ["free", "booked", "sold", "withdrawn"];

export const STATUS_STYLE: Record<TApartmentStatus, { dot: string; chip: string; bar: string }> = {
	free: {
		dot: "bg-emerald-500",
		chip: "border-emerald-200/70 bg-emerald-50 text-emerald-700",
		bar: "bg-emerald-400",
	},
	booked: {
		dot: "bg-amber-500",
		chip: "border-amber-200/70 bg-amber-50 text-amber-700",
		bar: "bg-amber-400",
	},
	sold: {
		dot: "bg-rose-500",
		chip: "border-rose-200/70 bg-rose-50 text-rose-700",
		bar: "bg-rose-400",
	},
	withdrawn: {
		dot: "bg-slate-400",
		chip: "border-slate-200 bg-slate-100 text-slate-600",
		bar: "bg-slate-300",
	},
};

export function statusStyle(status: string) {
	return STATUS_STYLE[status as TApartmentStatus] ?? STATUS_STYLE.withdrawn;
}
