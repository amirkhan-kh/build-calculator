import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
	reactStrictMode: true,

	logging: {
		fetches: {
			fullUrl: true,
			hmrRefreshes: true,
		},
	},
	poweredByHeader: false,
	typedRoutes: true,
	output: "standalone",
	transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
	images: {
		qualities: [75, 100],
	},
	compress: true,
	generateEtags: true,
	experimental: {
		inlineCss: true,
		dynamicOnHover: true,
		turbopackFileSystemCacheForDev: true,
		serverActions: {
			bodySizeLimit: "2mb",
		},
		optimizePackageImports: [
			"@hookform/resolvers",
			"@radix-ui/react-accordion",
			"@radix-ui/react-alert-dialog",
			"@radix-ui/react-checkbox",
			"@radix-ui/react-dialog",
			"@radix-ui/react-icons",
			"@radix-ui/react-scroll-area",
			"@radix-ui/react-select",
			"@radix-ui/react-slot",
			"@radix-ui/react-tabs",
			"@tanstack/react-query",
			"@tanstack/react-query-devtools",
			"class-variance-authority",
			"clsx",
			"cookies-next",
			"lottie-react",
			"lucide-react",
			"next",
			"next-intl",
			"next-themes",
			"react",
			"react-dom",
			"react-icons",
			"react-to-print",
			"sonner",
			"tailwind-merge",
			"tailwindcss-animate",
		],
	},
	headers: async () => {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Developed-By",
						value: "IT 911",
					},
				],
			},
			{
				source: "/:path*{/}?",
				headers: [
					{
						key: "X-Accel-Buffering",
						value: "no",
					},
				],
			},
		];
	},
};

export default withNextIntl(nextConfig);
