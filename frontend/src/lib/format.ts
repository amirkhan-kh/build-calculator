const numberFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

export function formatNumber(value: number | string | null | undefined) {
	const n = typeof value === "string" ? Number.parseFloat(value) : value;
	if (n === null || n === undefined || Number.isNaN(n)) return "—";
	return numberFormat.format(n);
}
