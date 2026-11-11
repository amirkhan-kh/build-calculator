"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUpdateApartment } from "@/action/hooks/apartments-hook/update-apartment.hook";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import type { IApartment, TApartmentStatus } from "@/types/apartment.types";
import { APARTMENT_STATUSES, statusStyle } from "@/lib/apartment-status";
import { cn } from "@/lib/cn";

interface StatusUpdateCellProps {
    apartment: IApartment;
}

export const StatusUpdateCell: React.FC<StatusUpdateCellProps> = ({
    apartment,
}) => {
    const { mutate: updateStatus, isPending } = useUpdateApartment();
    const t = useTranslations("status");
    const style = statusStyle(apartment.status);

    const handleStatusChange = (newStatus: string) => {
        updateStatus({
            id: apartment.id,
            data: {
                status: newStatus as TApartmentStatus,
                building_id: apartment.building_id,
                bct_ids: apartment.bct_ids || [],
            },
        });
    };

    return (
        <Select
            value={apartment.status}
            onValueChange={handleStatusChange}
            disabled={isPending}
        >
            <SelectTrigger
                className={cn(
                    "h-7 w-auto gap-1.5 rounded-full border px-2.5 text-xs font-medium shadow-none hover:border-current/30 focus-visible:ring-2 data-[state=open]:ring-2 [&>svg]:size-3.5 [&>svg]:text-current [&>svg]:opacity-60",
                    style.chip,
                )}
            >
                <span className="flex items-center gap-1.5">
                    {isPending ? (
                        <Loader2 className="size-3 animate-spin" />
                    ) : (
                        <span className={cn("size-1.5 rounded-full", style.dot)} />
                    )}
                    {t(apartment.status)}
                </span>
            </SelectTrigger>
            <SelectContent align="end">
                {APARTMENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                        <span className="flex items-center gap-2">
                            <span className={cn("size-2 rounded-full", statusStyle(status).dot)} />
                            {t(status)}
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
