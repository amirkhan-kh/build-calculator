export const ENV = {
	get PUBLIC_API_URL(): string {
		if (typeof window === "undefined") {
			return process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";
		}
		return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";
	},
};
