export interface ICoefficient {
	id: number;
	name: string;
	building_id: number | string;
}
export interface ICoefficientType {
	id: number;
	name: string;
	rate: number;
	coefficient_id: number;
	bcts: number[];
	building_id: number;
}
export type UpdateCoefficientTypePayload = {
	name: string;
	rate: string | number;
	coefficient_id: number;
};
export interface ICoefficientTypeGroup {
	id: number;
	name: string;
	bcts: ICoefficientType[];
}
export type CreateCoefficientTypePayload = {
	name: string;
	rate: number;
	building_id: number;
	coefficient_id: number;
};

export type CreateCoefficientPayload = {
	name: string;
	building_id: number;
};
