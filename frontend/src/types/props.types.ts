import { IApartment } from "./apartment.types";
import { IBuildings } from "./building.types";
import { ICoefficientType } from "./coefficient-type.types";
import { IComplex } from "./complex.types";
import { IRole } from "./permissions.types";
import { ComplexArray } from "./safe-response.types";

export interface Props {
	params: Promise<{ id: string }>;
}
export type TModalPropsAddedApartments = {
	onSuccess?: () => void;
	defaultBuildingId?: number | string;
};
export interface ModalDeleteApartmentsProps {
	apartmentId: string | number;
	buildingId?: number;
	onSuccess?: () => void;
}
export interface PropsModalUpdateApartments {
	apartment: IApartment;
}

export interface ApiError {
	message: string;
	detail?: string;
}
export interface PropsModalaUpdateCoefficientTypeApartment {
	coefficientType: ICoefficientType;
	buildingId: number;
	coefficientId: number;
}
export interface ModalDeleteCoefficientTypeProps {
	coefficientTypeId: number;
	buildingId: number;
	onSuccess?: () => void;
}

export interface PropsModalEditCoefficientType {
	coefficientType: ICoefficientType;
	coefficientId: number;
	buildingId: number;
}
export type ModalPropsModalAddedComplex = {
	onSuccess?: () => Promise<void>;
};
export interface ModalDeleteComplexProps {
	complexId: number;
	onSuccess?: () => void;
}
export interface TableApartmentsProps {
	initialApartments: IApartment[];
}
export interface TableBuildingsProps {
	buildings: IBuildings[];
}
export interface TableComplexProps {
	initialComplex: IComplex[] | ComplexArray;
}
export interface TabsProps {
	initialBuilding: IBuildings;
	allComplexes: IComplex[];
}
export interface ModalUpdateBuildingsProps {
	building: IBuildings;
	onSuccess?: () => void;
}

export interface PropsDeletePermissionManagement {
	permissionId: number | string;
	codename?: string;
}
export interface PropsDeleteRole {
	roleId: number | string;
	roleName?: string;
}

export interface PropsPatchRoleManagement {
	role: IRole;
}
