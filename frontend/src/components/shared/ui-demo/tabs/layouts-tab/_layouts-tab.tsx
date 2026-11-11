"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, LayoutGrid, Loader2, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useLayoutsByBuilding } from "@/action/hooks/layouts-hook/get-layouts.hook";
import { createLayout } from "@/action/layouts/create-layout.api";
import { deleteLayout } from "@/action/layouts/delete-layout.api";
import { uploadLayoutImage } from "@/action/layouts/upload-layout-image.api";
import { IMAGE_ACCEPT, validateImageFile } from "@/lib/image-file.util";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shared/kit/field";
import { Segmented } from "@/components/shared/kit/segmented";
import { EmptyState, LoadingState } from "@/components/shared/kit/empty-state";
import { ConfirmDialog, deleteTriggerClass } from "@/components/shared/kit/confirm-dialog";

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
    const [confirmId, setConfirmId] = useState<number | null>(null);

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
        <div className="flex flex-col gap-4">
            <form onSubmit={handleAdd} className="glass rounded-2xl p-4">
                <p className="mb-3 text-sm font-semibold text-slate-900">{t("add_title")}</p>
                <div className="flex flex-wrap items-end gap-3">
                    <Field label={t("rooms_label")}>
                        <Segmented
                            value={form.room_count}
                            onChange={(v) => setForm((p) => ({ ...p, room_count: v }))}
                            options={[
                                ...ROOM_OPTIONS.map((n) => ({ value: String(n), label: String(n) })),
                                { value: "6", label: "6+" },
                            ]}
                        />
                    </Field>
                    <Field label={t("area_label")} htmlFor="layout-area" required>
                        <Input
                            id="layout-area"
                            type="number"
                            step="0.01"
                            min="1"
                            value={form.area}
                            onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
                            placeholder="65.50"
                            required
                            className="w-28"
                        />
                    </Field>
                    <Field
                        label={<>{t("name_label")} <span className="font-normal text-slate-400">({t("optional")})</span></>}
                        htmlFor="layout-name"
                        className="min-w-[180px] flex-1"
                    >
                        <Input
                            id="layout-name"
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Студия, Евро-2 ..."
                        />
                    </Field>
                    <Button type="submit" disabled={isSubmitting} className="h-10">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus />}
                        {isSubmitting ? t("adding") : t("add_btn")}
                    </Button>
                </div>
            </form>

            {isLoading ? (
                <LoadingState className="min-h-40" />
            ) : layouts.length === 0 ? (
                <EmptyState icon={LayoutGrid} title={t("empty")} description={t("empty_hint")} />
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                    {layouts.map((layout) => {
                        const uploading = uploadingId === layout.id;
                        return (
                            <div
                                key={layout.id}
                                className="group overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-xs backdrop-blur-sm transition-shadow hover:shadow-[0_12px_32px_-16px_rgb(30_33_80/0.25)]"
                            >
                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={() => fileInputRefs.current[layout.id]?.click()}
                                    className="relative block aspect-[4/3] w-full overflow-hidden border-b border-slate-100 bg-slate-50"
                                    title={layout.image_url ? t("replace_btn") : t("upload_btn")}
                                >
                                    {layout.image_url ? (
                                        <Image
                                            fill
                                            unoptimized
                                            src={layout.image_url}
                                            alt={t("col_layout")}
                                            sizes="260px"
                                            className="object-contain p-3"
                                        />
                                    ) : (
                                        <span className="flex h-full flex-col items-center justify-center gap-1.5 text-slate-400 transition-colors group-hover:text-indigo-500">
                                            <ImagePlus size={22} strokeWidth={1.75} />
                                            <span className="text-xs font-medium">{t("upload_btn")}</span>
                                        </span>
                                    )}
                                    {layout.image_url && !uploading && (
                                        <span className="absolute inset-0 grid place-items-center bg-slate-950/40 text-xs font-medium text-white opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                                            {t("replace_btn")}
                                        </span>
                                    )}
                                    {uploading && (
                                        <span className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-[2px]">
                                            <Loader2 size={20} className="animate-spin text-indigo-500" />
                                        </span>
                                    )}
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
                                <div className="flex items-center gap-2 p-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="flex items-baseline gap-2">
                                            <span className="text-base font-semibold tabular-nums text-slate-900">
                                                {layout.area} {t("area_suffix")}
                                            </span>
                                            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
                                                {layout.room_count}{t("room_suffix")}
                                            </span>
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-slate-500">{layout.name || "—"}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmId(layout.id)}
                                        className={deleteTriggerClass}
                                        aria-label={tc("delete")}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ConfirmDialog
                open={confirmId !== null}
                onOpenChange={(v) => !v && setConfirmId(null)}
                title={t("delete_title")}
                description={t("delete_confirm")}
                pending={deletingId !== null}
                onConfirm={async () => {
                    if (confirmId !== null) await handleDelete(confirmId);
                    setConfirmId(null);
                }}
            />
        </div>
    );
}
