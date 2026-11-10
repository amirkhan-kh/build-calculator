function trimTrailingSlash(url: string): string {
	return url.replace(/\/$/, "");
}

export const ENV = {
	get PUBLIC_API_URL(): string {
		if (typeof window === "undefined") {
			return trimTrailingSlash(
				process.env.INTERNAL_API_URL ??
					process.env.NEXT_PUBLIC_API_URL ??
					"http://localhost:8001",
			);
		}
		return trimTrailingSlash(
			process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001",
		);
	},
};
