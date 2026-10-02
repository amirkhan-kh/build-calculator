declare module "*.css";

declare var process: {
	env: Record<string, string | undefined>;
};

// Image imports
declare module "*.png" {
	import type { StaticImageData } from "next/image";
	const content: StaticImageData;
	export default content;
}
declare module "*.jpg" {
	import type { StaticImageData } from "next/image";
	const content: StaticImageData;
	export default content;
}
declare module "*.svg" {
	const content: React.FC<React.SVGProps<SVGSVGElement>>;
	export default content;
}

// Stub for Next.js typed routes (normally generated in .next/types/link.d.ts by next build)
declare namespace __next_route_internal_types__ {
	type RouteImpl<T> = string & {};
}
