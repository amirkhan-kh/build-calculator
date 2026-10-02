export type TApartmentStatus = "free" | "sold" | "booked" | "withdrawn";

export interface IApartment {
    id: number;
    number: string;
    floor: number;
    area: string;
    room_count: number;
    status: TApartmentStatus;
    final_price: string;
    total_price: string;
    price_unit: string;
    building_id: number;
    bct_ids: number[];
}

export interface ApartmentFormData {
    number: string;
    floor: number;
    room_count: number;
    area: string;
    final_price: string;
    status: TApartmentStatus;
}
