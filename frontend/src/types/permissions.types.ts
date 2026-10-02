export interface IPermission {
	id: number;
	codename: string;
}

export interface IPermissionFilters extends Record<string, unknown> {
	search?: string;
}
export interface IUpdatePermissionPayload {
	id: number | string;
	data: Partial<IPermission>;
}
export interface IRole {
	id: number;
	name: string;
	permissions?: IPermission[];
	created_at?: string;
	updated_at?: string;
}

export interface IPatchRolePayload {
	name?: string;
	permission_ids?: number[];
}

export interface IUpdateRoleArgs {
	id: number | string;
	payload: IPatchRolePayload;
}
