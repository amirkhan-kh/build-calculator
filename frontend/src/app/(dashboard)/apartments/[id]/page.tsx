import { PiBuildingApartmentFill } from "react-icons/pi";
import { TfiRulerAlt2 } from "react-icons/tfi";
import {
	MdHomeWork,
	MdOutlineHome,
	MdOutlineMeetingRoom,
} from "react-icons/md";
import Link from "next/link";
import { FaAngleLeft, FaKey } from "react-icons/fa";
import { GrMoney } from "react-icons/gr";
import { ModalDeleteApartments } from "@/components/shared/ui-demo/modals/apartments-modals/modal-delete-apartments/_modal-delete-apartment";
import { ModalUpdateApartments } from "@/components/shared/ui-demo/modals/apartments-modals/modal-update-apartments/_modal-update-apartment";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { getApartmentById } from "@/action/apartaments/get-apartament.api";
import { getCoefficientTypesByBuildingId } from "@/action/coefficient-types/get-coefficient-type.api";
import { ModalaUpdateCoefficientTypeApartment } from "@/components/shared/ui-demo/modals/apartments-modals/modal-update-coefficient-type-apartment/_modala-update-coefficient-type-apartment";
import { getAuthData } from "@/lib/auth.util";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Props } from "@/types/props.types";

export default async function SingleApartmentsPage({ params }: Props) {
	const { access } = await getAuthData();
	if (!access) redirect("/login");
	const { id } = await params;
	if (!id) redirect("/");

	const t = await getTranslations("apartment");
	const tc = await getTranslations("common");
	const tf = await getTranslations("filter");

	const apartment = await getApartmentById(Number(id));

	if (!apartment || !apartment.data) {
		return (
			<div className="container mx-auto p-10 text-center">
				<h1 className="text-xl font-bold text-gray-600">{t("not_found_page")}</h1>
				<Link href="/" className="text-indigo-600 underline">
					{tc("back_to_list")}
				</Link>
			</div>
		);
	}

	const apartmentData = apartment.data;

	const allCoefficientTypes = await getCoefficientTypesByBuildingId(
		Number(apartmentData.building_id),
	);

	const apartmentCoefficients = allCoefficientTypes
		.flatMap((group) => group.bcts || [])
		.filter((bct) => (apartmentData.bct_ids ?? []).includes(bct.id));

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Link href={`/buildings/${apartmentData.building_id}`}>
					<button className="text-gray-200 hover:text-white bg-indigo-900 px-3 py-1 rounded-[3px]">
						<FaAngleLeft />
					</button>
				</Link>
				<ModalDeleteApartments
					apartmentId={Number(apartmentData.id)}
					buildingId={Number(apartmentData.building_id)}
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 ">
				<div className="col-span-2">
					<div className="overflow-hidden rounded-sm bg-gradient-to-br from-indigo-200 via-indigo-100 to-white border border-indigo-100 shadow-[0_8px_32px_rgba(99,102,241,0.08)] mb-2">
						<div className="p-4">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-bold text-indigo-600">
									{t("main_info")}
								</h2>
								<div className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-white border border-indigo-200 rounded-sm text-sm font-medium text-indigo-700">
									{apartmentData.room_count} {t("rooms_suffix")}
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 ">
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center">
											<span className="text-sm text-indigo-600">
												<MdOutlineHome />
											</span>
										</div>
										<span className="text-sm font-medium text-gray-500">
											{t("building_id_label")}
										</span>
									</div>
									<div className="text-lg font-semibold text-gray-900">
										{apartmentData.building_id}
									</div>

									<div className="group">
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center">
												<span className="text-sm text-indigo-600">
													<FaKey />
												</span>
											</div>
											<span className="text-sm font-medium text-gray-500">
												{t("number_label")}
											</span>
										</div>
										<div className="text-lg font-semibold text-gray-900">
											{apartmentData.number}
										</div>
									</div>

									<div className="group">
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center">
												<span className="text-sm text-indigo-600">
													<PiBuildingApartmentFill />
												</span>
											</div>
											<span className="text-sm font-medium text-gray-500">
												{tf("floor_label")}
											</span>
										</div>
										<div className="text-lg font-semibold text-gray-900">
											{apartmentData.floor}
											<span className="text-sm text-gray-500 ml-1">{t("floor_suffix")}</span>
										</div>
									</div>
								</div>

								<div className="space-y-4">
									<div className="group">
										<div className="flex items-center gap-2 mb-1">
											<div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center">
												<span className="text-sm text-indigo-600">
													<TfiRulerAlt2 />
												</span>
											</div>
											<span className="text-sm font-medium text-gray-500">
												{tf("area_label")}
											</span>
										</div>
										<div className="text-lg font-semibold text-gray-900">
											{apartmentData.area} м²
										</div>
									</div>

									<div className="group">
										<div className="flex items-center gap-2 mb-1">
											<div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center">
												<span className="text-sm text-indigo-600">
													<MdOutlineMeetingRoom />
												</span>
											</div>
											<span className="text-sm font-medium text-gray-500">
												{tf("rooms_label")}
											</span>
										</div>
										<div className="text-lg font-semibold text-gray-900">
											{apartmentData.room_count}
										</div>
									</div>
									<div className="group">
										<div className="flex items-center gap-2 mb-1">
											<div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center">
												<span className="text-sm text-indigo-600">
													<GrMoney />
												</span>
											</div>
											<span className="text-sm font-medium text-gray-500">
												{tf("price")}
											</span>
										</div>
										<div className="text-lg font-semibold text-gray-900">
											{parseFloat(apartmentData.total_price).toLocaleString()}{" "}
											<span className="text-sm font-medium text-gray-500">{apartmentData.price_unit}</span>
										</div>
										<div className="text-xs text-gray-400">
											{parseFloat(apartmentData.final_price).toLocaleString()} {apartmentData.price_unit} / м²
										</div>
									</div>
								</div>
							</div>
							<div className="flex justify-between pt-4">
								<span></span>
								<ModalUpdateApartments apartment={apartmentData} />
							</div>
						</div>
					</div>

					{apartmentCoefficients.length > 0 && (
						<div className="overflow-hidden rounded-sm bg-gradient-to-br from-indigo-100 to-white border border-indigo-100 p-4 mt-4">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-md text-indigo-600 flex items-center gap-2 font-bold">
									<LuChartNoAxesCombined />
									{t("active_coefficients")}
								</h2>
								<span className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-sm text-sm font-medium text-indigo-700">
									{t("applied_count", { count: apartmentCoefficients.length })}
								</span>
							</div>

							<div className="grid grid-cols-2 gap-4">
								{apartmentCoefficients.map((bct) => (
									<div
										key={bct.id}
										className="p-4 bg-white border border-indigo-100 rounded-sm shadow-sm"
									>
										<div className="flex flex-col">
											<div className="flex items-center gap-2 ">
												<div className="flex gap-3.5 items-center bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-1.5 rounded-lg border border-indigo-100">
													<span className="text-base font-semibold text-indigo-700">
														{bct.name}:
													</span>
													<span className="text-lg font-bold text-violet-700">
														{bct.rate}%
													</span>
												</div>

												<span className="text-[10px] bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-2 py-1 rounded-full border border-green-100 font-medium">
													{t("active_badge")}
												</span>
											</div>
										</div>
										<div className="flex items-center justify-end">
											<ModalaUpdateCoefficientTypeApartment
												coefficientType={bct}
												buildingId={Number(apartmentData.building_id)}
												coefficientId={bct.coefficient_id}
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				<div className="space-y-2">
					<div className="rounded-sm px-3 py-1.5 text-indigo-600 bg-gradient-to-br from-indigo-200 to-white flex items-end justify-center gap-2.5 shadow-sm">
						<span className="text-2xl ">
							<MdHomeWork size={30} />
						</span>
						<h1 className="text-md font-bold ">
							{t("apartment_number_label")}: {apartmentData.number}
						</h1>
					</div>

					<div className="overflow-hidden text-indigo-600 rounded-sm bg-gradient-to-br from-indigo-100 to-white border border-indigo-100 p-4">
						<h3 className="text-sm font-medium mb-3">{t("quick_metrics")}</h3>
						<div className="grid grid-cols-2 gap-3">
							<div className="text-center p-2 bg-white border border-indigo-100 rounded-lg">
								<div className="text-xs text-gray-500">{t("total_label_short")}</div>
								<div className="text-sm font-bold text-indigo-700">
									{parseFloat(apartmentData.total_price).toLocaleString()}
								</div>
								<div className="text-[10px] text-gray-400">{apartmentData.price_unit}</div>
							</div>
							<div className="text-center p-2 bg-white border border-indigo-100 rounded-lg">
								<div className="text-xs text-gray-500">{t("price_per_sqm_short")}</div>
								<div className="text-sm font-bold text-indigo-700">
									{parseFloat(apartmentData.final_price).toLocaleString()}
								</div>
								<div className="text-[10px] text-gray-400">{apartmentData.price_unit}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
