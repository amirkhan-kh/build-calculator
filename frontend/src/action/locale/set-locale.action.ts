"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const SUPPORTED_LOCALES = ["ru", "uz", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

export async function setLocale(locale: Locale) {
	if (!SUPPORTED_LOCALES.includes(locale)) return;

	const cookieStore = await cookies();
	cookieStore.set("NEXT_LOCALE", locale, {
		maxAge: 60 * 60 * 24 * 365,
		path: "/",
		sameSite: "lax",
	});

	revalidatePath("/", "layout");
}
