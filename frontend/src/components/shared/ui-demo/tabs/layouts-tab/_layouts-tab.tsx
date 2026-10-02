"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { MdOutlineDeleteForever } from "react-icons/md";
import { ImFilesEmpty } from "react-icons/im";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useLayoutsByBuilding } from "@/action/hooks/layouts-hook/get-layouts.hook";
import { createLayout } from "@/action/layouts/create-layout.api";
import { deleteLayout } from "@/action/layouts/delete-layout.api";
import { uploadLayoutImage } from "@/action/layouts/upload-layout-image.api";
import { IMAGE_ACCEPT, validateImageFile } from "@/lib/image-file.util";

interface LayoutsTabProps {
    buildingId: number;
}

const ROOM_OPTIONS = [1, 2, 3, 4, 5];

export function LayoutsTab({ buildingId }: LayoutsTabProps) {
    const queryClient = useQueryClient();
    const { data: layouts = [], isLoading } = useLayoutsByBuilding(buildingId);
    const t = useTranslations("layout");
    const tc = useTranslations("common");

    const [form, setForm] = useState({ room_count: "1", area: "", name: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [uploadingId, setUploadingId] = useState<number | null>(null);

    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["layouts", "building", buildingId] });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.area || Number(form.area) <= 0) {
            toast.error(t("enter_area"));
            return;
        }
        setIsSubmitting(true);
        const result = await createLayout({
            building_id: buildingId,
            room_count: Number(form.room_count),
            area: form.area,
            name: form.name || undefined,
        });
        setIsSubmitting(false);

        if (!result) {
            toast.error(t("add_error"));
            return;
        }

        const isExisting = layouts.some((l) => l.id === result.id);
        if (isExisting) {
            toast.info(t("exists"));
        } else {
            toast.success(t("added_success"));
            setForm({ room_count: "1", area: "", name: "" });
            invalidate();
        }
    };

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        const ok = await deleteLayout(id);
        setDeletingId(null);
        if (ok) {
            toast.success(t("deleted_success"));
            invalidate();
        } else {
            toast.error(t("delete_error"));
        }
    };

    const handleImageUpload = async (layoutId: number, file: File) => {
        const errorKey = validateImageFile(file);
        if (errorKey) {
            toast.error(t("image_error"));
            return;
        }
        setUploadingId(layoutId);
        const result = await uploadLayoutImage(layoutId, file);
        setUploadingId(null);
        if (result) {
            toast.success(t("image_uploaded"));
            invalidate();
        } else {
            toast.error(t("image_error"));
        }
    };

    return (
        <div className="relative overflow-hidden rounded-sm bg-gradient-to-br from-indigo-200 via-indigo-100 to-indigo-100 py-6 px-3 space-y-4">

            <form
                onSubmit={handleAdd}
                className="bg-white rounded-sm border border-indigo-200 p-4 shadow-sm"
            >
                <p className="text-sm font-semibold text-gray-700 mb-3">
                    {t("add_title")}
                </p>
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-medium">
                            {t("rooms_label")}
                        </label>
                        <select
                            value={form.room_count}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, room_count: e.target.value }))
                            }
                            className="h-9 border rounded px-3 text-sm bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
                        >
                            {ROOM_OPTIONS.map((n) => (
                                <option key={n} value={n}>
                                    {n}{t("room_suffix")}
                                </option>
                            ))}
                            <option value="6">6+</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-medium">
                            {t("area_label")}
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="1"
                            value={form.area}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, area: e.target.value }))
                            }
                            placeholder="65.50"
                            required
                            className="h-9 w-28 border rounded px-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                        />
                    </div>

                    <div className="space-y-1 flex-1 min-w-[140px]">
                        <label className="text-xs text-gray-500 font-medium">
                            {t("name_label")}{" "}
                            <span className="font-normal text-gray-400">
                                ({t("optional")})
                            </span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, name: e.target.value }))
                            }
                            placeholder="Студия, Евро-2 ..."
                            className="h-9 w-full border rounded px-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-9 px-5 bg-[#282964] text-white text-sm rounded hover:bg-[#1f2050] disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? t("adding") : t("add_btn")}
                    </button>
                </div>
            </form>

            <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="py-8 text-center text-gray-400 text-sm">
                        {t("loading")}
                    </div>
                ) : layouts.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
                        <ImFilesEmpty size={32} />
                        <p className="text-sm font-medium">{t("empty")}</p>
                        <p className="text-xs text-gray-400">
                            {t("empty_hint")}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t("col_rooms")}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t("col_area")}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t("col_name")}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t("col_layout")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t("col_action")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {layouts.map((layout, idx) => (
                                <tr
                                    key={layout.id}
                                    className="hover:bg-indigo-50/40 transition-colors"
                                >
                                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                            {layout.room_count}{t("room_suffix")}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-800">
                                        {layout.area} {t("area_suffix")}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {layout.name || (
                                            <span className="text-gray-300 italic text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {layout.image_url && (
                                                <div className="relative w-10 h-10 flex-shrink-0">
                                                    <Image
                                                        fill
                                                        unoptimized
                                                        src={layout.image_url}
                                                        alt={t("col_layout")}
                                                        className="object-cover rounded border border-gray-200"
                                                    />
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                disabled={uploadingId === layout.id}
                                                onClick={() =>
                                                    fileInputRefs.current[layout.id]?.click()
                                                }
                                                className="text-xs px-2 py-1 rounded border border-indigo-300 text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 transition-colors whitespace-nowrap"
                                            >
                                                {uploadingId === layout.id
                                                    ? t("uploading")
                                                    : layout.image_url
                                                    ? t("replace_btn")
                                                    : t("upload_btn")}
                                            </button>
                                            <input
                                                ref={(el) => {
                                                    fileInputRefs.current[layout.id] = el;
                                                }}
                                                type="file"
                                                accept={IMAGE_ACCEPT}
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageUpload(layout.id, file);
                                                    e.target.value = "";
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(layout.id)}
                                            disabled={deletingId === layout.id}
                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                                        >
                                            <MdOutlineDeleteForever size={16} />
                                            {deletingId === layout.id ? tc("deleting") : tc("delete")}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
