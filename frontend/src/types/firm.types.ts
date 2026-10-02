export interface IFirm {
	id: number;
	name: string;
	username: string;
	password: string;
	is_active: boolean;
}

export type FirmStatusFilter = "all" | "active" | "inactive";
