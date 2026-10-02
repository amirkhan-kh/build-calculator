import { ArrowLeft } from "lucide-react";
import { ImFileEmpty } from "react-icons/im";
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
	const tc = await getTranslations("common");
	const tco = await getTranslations("complex");
	const currentComplexSafe = await getComplexById(id);

	const currentComplex = currentComplexSafe.data;

	if (!currentComplex) {
		return (
			<div className="flex items-center justify-center flex-col h-screen">
				<p className="text-center font-bold text-gray-500">
					{tc("not_found")}
				</p>
				<ImFileEmpty size={40} className="text-gray-300 mt-2" />
				<Link href="/complex" className="mt-4 text-indigo-600 underline">
					{tc("back_to_list")}
				</Link>
			</div>
		);
	}

	return (
		<div>
			<Link
				href="/"
				className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-indigo-600 transition-colors mb-5"
			>
				<ArrowLeft size={16} />
				{tco("back_to_complexes")}
			</Link>

			<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
				<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
					<div className="flex items-center gap-4">
						<ComplexLogoUpload
							complexId={currentComplex.id}
							logoUrl={currentComplex.logo_url ?? null}
						/>
						<div>
							<span className="inline-block text-[10px] font-bold uppercase tracking-wide text-indigo-400 mb-1">
								{tco("page_badge")}
							</span>
							<h1 className="text-2xl font-black text-gray-900 capitalize">
								{currentComplex.name || "—"}
							</h1>
						</div>
					</div>

					<div className="flex gap-2.5 items-center">
						<ModalUpdateComplex complex={currentComplex} />
						<ModalDeleteComplex complexId={currentComplex.id} />
					</div>
				</div>

				<div className="mt-5 rounded-xl bg-gray-50 p-4">
					<p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">
						{tco("description_label")}
					</p>
					{currentComplex.description ? (
						<p className="text-sm text-gray-700">
							{currentComplex.description}
						</p>
					) : (
						<p className="flex items-center gap-2 text-sm text-gray-400">
							<ImFileEmpty /> {tco("description_absent")}
						</p>
					)}
				</div>
			</div>

			<ComplexBuildingsSection complexId={Number(currentComplex.id)} complexName={currentComplex.name} />
		</div>
	);
}
