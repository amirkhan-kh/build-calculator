import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
	return (
		<div className="space-y-4 py-2" aria-busy="true">
			<div className="flex items-center justify-between gap-4">
				<Skeleton className="h-9 w-56" />
				<Skeleton className="h-9 w-32" />
			</div>
			<div className="flex gap-3">
				<Skeleton className="h-10 flex-1" />
				<Skeleton className="h-10 w-40" />
				<Skeleton className="h-10 w-40" />
			</div>
			<div className="space-y-2 rounded-md border border-gray-100 bg-white p-4">
				{Array.from({ length: 8 }).map((_, i) => (
					<Skeleton key={i} className="h-10 w-full" />
				))}
			</div>
		</div>
	);
}
