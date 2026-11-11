import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
	return (
		<div aria-busy="true">
			<div className="mb-5 flex items-end justify-between gap-4">
				<div className="flex flex-col gap-2">
					<Skeleton className="h-7 w-52" />
					<Skeleton className="h-4 w-72" />
				</div>
				<Skeleton className="h-9 w-36 rounded-lg" />
			</div>
			<div className="glass mb-5 flex gap-2 rounded-2xl p-2">
				<Skeleton className="h-10 flex-1 rounded-lg" />
				<Skeleton className="hidden h-10 w-40 rounded-lg sm:block" />
				<Skeleton className="hidden h-10 w-40 rounded-lg md:block" />
			</div>
			<div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="surface flex flex-col gap-4 p-4">
						<div className="flex items-center gap-3">
							<Skeleton className="size-12 rounded-xl" />
							<div className="flex flex-1 flex-col gap-2">
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-3 w-1/3" />
							</div>
						</div>
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-2/3" />
					</div>
				))}
			</div>
		</div>
	);
}
