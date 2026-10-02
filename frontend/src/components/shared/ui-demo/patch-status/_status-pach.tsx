"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUpdateApartment } from "@/action/hooks/apartments-hook/update-apartment.hook";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { IApartment, TApartmentStatus } from "@/types/apartment.types";

interface StatusUpdateCellProps {
    apartment: IApartment;
}

const statusClassName: Record<TApartmentStatus, string> = {
    free: "bg-green-200 text-gray-800",
    sold: "bg-red-200 text-gray-800",
    booked: "bg-yellow-200 text-gray-800",
    withdrawn: "bg-gray-300 text-gray-800",
};

const STATUS_KEYS: TApartmentStatus[] = ["free", "sold", "booked", "withdrawn"];

export const StatusUpdateCell: React.FC<StatusUpdateCellProps> = ({
    apartment,
}) => {
    const { mutate: updateStatus, isPending } = useUpdateApartment();
    const t = useTranslations("status");

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
            defaultValue={apartment.status}
            onValueChange={handleStatusChange}
            disabled={isPending}
        >
            <SelectTrigger
                className={`h-6 w-32 border-none shadow-none focus:ring-0 px-3 py-1 rounded-md text-sm font-medium ${
                    statusClassName[apartment.status as TApartmentStatus]
                }`}
            >
                {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                    <SelectValue />
                )}
            </SelectTrigger>
            <SelectContent>
                {STATUS_KEYS.map((status) => (
                    <SelectItem key={status} value={status}>
                        {t(status)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
