import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin", "latin-ext", "cyrillic"],
	display: "swap",
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin", "cyrillic"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Admin Panel",
	description: "Internal system",
	robots: {
		index: false,
		follow: false,
		nocache: true,
		noarchive: true,
		nosnippet: true,
		notranslate: true,
	},
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const locale = await getLocale();
	const messages = await getMessages();

	return (
		<html lang={locale}>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<NextIntlClientProvider messages={messages}>
					<QueryProvider>{children}</QueryProvider>
				</NextIntlClientProvider>
				<Toaster
					position="top-right"
					richColors
					closeButton
					toastOptions={{ className: "!rounded-xl !text-[13px]" }}
				/>
			</body>
		</html>
	);
}
