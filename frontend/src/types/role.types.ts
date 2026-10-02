import { IPermission } from "./permissions.types";

export interface IRole {
	id: number;
	name: string;
	permissions?: IPermission[];
	created_at?: string;
	updated_at?: string;
}

export interface IRoleFilters extends Record<string, unknown> {
	search?: string;
	page?: number;
	limit?: number;
}
export interface ICreateRolePayload {
	name: string;
	permission_ids: number[];
}
