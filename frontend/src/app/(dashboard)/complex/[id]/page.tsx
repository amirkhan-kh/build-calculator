import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/shared/kit/empty-state";
import { BackLink } from "@/components/shared/kit/back-link";
import { ModalDeleteComplex } from "@/components/shared/ui-demo/modals/complex-modal/modal-delete-complex/_modal-delete-complex";
import Link from "next/link";
import ModalUpdateComplex from "@/components/shared/ui-demo/modals/complex-modal/modal-update-complex/_modal-update-complex";
import { getComplexById } from "@/action/complex/get-complex.api";
import { getAuthData } from "@/lib/auth.util";
import { redirect } from "next/navigation";
import { Props } from "@/types/props.types";
import ComplexLogoUpload from "@/components/shared/ui-demo/complex-logo-upload/_complex-logo-upload";
import ComplexBuildingsSection from "@/components/shared/ui-demo/complex-buildings-section/_complex-buildings-section";
import { getTranslations } from "next-intl/server";

export default async function SingleComplexPage({ params }: Props) {
	const { access } = await getAuthData();
	if (!access) redirect("/login");
	const { id } = await params;
	if (!id) redirect("/complex");
	const [tc, tco, currentComplexSafe] = await Promise.all([
		getTranslations("common"),
		getTranslations("complex"),
		getComplexById(id),
	]);

	const currentComplex = currentComplexSafe.data;

	if (!currentComplex) {
		return (
			<EmptyState
				className="mt-10"
				icon={SearchX}
				title={tc("not_found")}
				action={
					<Link href="/" className="text-sm font-medium text-ink hover:underline">
						{tc("back_to_list")}
					</Link>
				}
			/>
		);
	}

	return (
		<div>
			<BackLink href="/">{tco("back_to_complexes")}</BackLink>

			<div className="glass rounded-2xl p-5">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
					<ComplexLogoUpload
						complexId={currentComplex.id}
						logoUrl={currentComplex.logo_url ?? null}
					/>
					<div className="min-w-0 flex-1">
						<p className="eyebrow">{tco("page_badge")}</p>
						<h1 className="mt-0.5 truncate text-2xl font-semibold tracking-tight text-slate-900">
							{currentComplex.name || "—"}
						</h1>
						<p className={currentComplex.description ? "mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-600" : "mt-1.5 text-sm text-slate-400"}>
							{currentComplex.description || tco("description_absent")}
						</p>
					</div>
					<div className="flex shrink-0 items-center gap-1.5">
						<ModalUpdateComplex complex={currentComplex} />
						<ModalDeleteComplex complexId={currentComplex.id} />
					</div>
				</div>
			</div>

			<ComplexBuildingsSection complexId={Number(currentComplex.id)} complexName={currentComplex.name} />
		</div>
	);
}
