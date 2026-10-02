export interface ILayout {
    id: number;
    building_id: number;
    room_count: number;
    area: string;
    name: string | null;
    image_url: string | null;
}

export interface ICreateLayoutBody {
    building_id: number;
    room_count: number;
    area: string;
    name?: string;
}
