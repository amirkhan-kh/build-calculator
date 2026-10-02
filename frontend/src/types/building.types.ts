import { IApartment } from "./apartment.types";

export interface IBuildings {
	id: number | string;
	name: string;
	floor_count: number | string;
	price_unit: string;
	max_coefficient: number;
	base_price: string | number;
	complex_id: number | string;
}
export interface UpdateArgs {
	id: number | string;
	data: Partial<IApartment>;
}
export interface UpdateBuildingArgs {
	id: string | number;
	data: Partial<IBuildings>;
}

export interface UpdateBuildingMutationArgs {
	id: string | number;
	data: Partial<IBuildings> | FormData;
	params?: Record<string, unknown>;
}
