"use client";
import { FC } from "react";
import { ModalAddedCoefficientName } from "../building-cofficient-add-name/_building-coefficient-add-name";
import { ModalAddedCoefficientType } from "../modal-coefficient-type-add/_modal-coefficient-type-add";
import { ModalEditCoefficientType } from "../../coefficient-type-modals/coefficient-type-update/_coefficient-type-delete";
import { ModalDeleteCoefficientType } from "../../coefficient-type-modals/coefficient-type-delete/_coefficient-type-delete";
import { ImFilesEmpty } from "react-icons/im";
import { MdOutlineDeleteForever } from "react-icons/md";
import { useCoefficientTypesByBuildingId } from "@/action/hooks/coefficient-type-hook/get-coefficient-type";
import { useDeleteCoefficient } from "@/action/hooks/coefficient-hook/delete-coefficient";
import type { ICoefficientTypeGroup } from "@/types/coefficient-type.types";

interface ModalAddedCoefficientProps {
	buildingId: number;
}
export const ModalAddedCoefficient: FC<ModalAddedCoefficientProps> = ({
	buildingId,
}) => {
	const coefRes = useCoefficientTypesByBuildingId(buildingId);

	const coefficientTypeGroups = Array.isArray(coefRes?.data)
		? (coefRes.data as ICoefficientTypeGroup[])
		: [];
	const deleteMutation = useDeleteCoefficient(buildingId);

	return (
		<div className="relative overflow-hidden rounded-sm bg-gradient-to-br from-indigo-200 via-indigo-100 to-indigo-100 py-6 px-3">
			<div className="mb-4">
				<ModalAddedCoefficientName
					buildingId={buildingId}
					onSuccess={() => {}}
				/>
			</div>
			<div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					{coefficientTypeGroups.length === 0 ? (
						<div className="py-8 px-6 text-center">
							<div className="inline-flex flex-col items-center gap-3">
								<ImFilesEmpty className="text-gray-400" size={32} />
								<p className="text-gray-600 font-medium">
									Информация не введена.
								</p>
							</div>
						</div>
					) : (
						coefficientTypeGroups.map((group) => (
							<div key={group.id} className="flex flex-col gap-4">
								<div className="bg-indigo-50/50 border-y border-indigo-100">
									<div className="py-3 px-6 flex items-center justify-between">
										<h3 className="font-semibold text-gray-900">
											{group.name}
										</h3>
										<div className="flex items-center gap-2.5">
											<button
												onClick={() => {
													deleteMutation.mutate({
														id: group.id,
													});
												}}
												className="bg-gradient-to-br from-indigo-100 to-white hover:bg-red-50 px-2 py-1 rounded-[3px] transition-colors border border-indigo-100 hover:border-red-200"
												disabled={deleteMutation.isPending}
											>
												<MdOutlineDeleteForever
													size={20}
													className={
														deleteMutation.isPending
															? "text-gray-400 animate-pulse"
															: "text-gray-500"
													}
												/>
											</button>
											<ModalAddedCoefficientType
												buildingId={buildingId}
												coefficientId={group.id}
											/>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-3">
									<div className="py-1 px-6 border-r border-gray-200">
										Название коэффициента здания
									</div>
									<div className="py-1 px-6 border-r border-gray-200">
										Коэффициента ставка
									</div>
									<div></div>
								</div>

								{group.bcts.length === 0
									? null
									: group.bcts.map((bct, index) => (
											<div
												key={bct.id}
												className="hover:bg-gray-50 transition-colors border-b border-gray-100 grid grid-cols-3"
											>
												<div className="px-6 py-2 border-r border-gray-200 flex items-center gap-3">
													<div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center">
														<span className="text-blue-600 font-medium">
															{index + 1}
														</span>
													</div>
													<span className="font-medium text-gray-900">
														{bct.name}
													</span>
												</div>

												<div className="px-6 border-r border-gray-200 flex items-center gap-3">
													<span className="font-medium text-gray-900">
														{bct.rate}%
													</span>
													<div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
														<div
															className="h-full bg-gradient-to-r from-indigo-300 to-purple-300"
															style={{
																width: `${Math.min(Math.abs(Number(bct.rate)), 100)}%`,
															}}
														/>
													</div>
												</div>

												<div className="px-6 flex items-center gap-2 justify-end">
													<ModalEditCoefficientType
														coefficientType={bct}
														buildingId={buildingId}
														coefficientId={group.id}
													/>

													<ModalDeleteCoefficientType
														coefficientTypeId={bct.id}
														buildingId={buildingId}
													/>
												</div>
											</div>
										))}
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};
