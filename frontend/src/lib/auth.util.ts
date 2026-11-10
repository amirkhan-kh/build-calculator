import { getAuthDataAction } from "./auth.action";

type AuthData = Awaited<ReturnType<typeof getAuthDataAction>>;

// Browser-side cache: without it every API call would first make a server
// action round trip to Vercel, and Next.js runs server actions one at a time.
const EXPIRY_MARGIN_SEC = 30;
let cached: { data: AuthData; exp: number } | null = null;
let inflight: Promise<AuthData> | null = null;

function readTokenExp(token: string): number {
	try {
		const payload = JSON.parse(
			atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
		);
		return typeof payload.exp === "number" ? payload.exp : 0;
	} catch {
		return 0;
	}
}

export function clearAuthCache() {
	cached = null;
	inflight = null;
}

export async function getAuthData(): Promise<AuthData> {
	if (typeof window === "undefined") {
		return getAuthDataAction();
	}

	if (cached && cached.exp - EXPIRY_MARGIN_SEC > Date.now() / 1000) {
		return cached.data;
	}

	if (!inflight) {
		inflight = getAuthDataAction()
			.then((data) => {
				if (data?.access) {
					cached = { data, exp: readTokenExp(data.access) };
				}
				return data;
			})
			.finally(() => {
				inflight = null;
			});
	}

	return inflight;
}
