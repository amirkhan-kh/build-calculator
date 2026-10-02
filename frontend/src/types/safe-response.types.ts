export type TMetaReason = "TOKEN" | "HTTP" | "PARSE" | "UNKNOWN";

export interface IMetaInfo {
	status?: number;
	error?: string;
	reason?: TMetaReason;
}

export interface SafeObject<T> {
	data: T | null;
	_meta?: IMetaInfo;
}
export interface SafeDelete {
	success: boolean;
	_meta?: IMetaInfo;
}
export type SafeArray<T> = T[] & {
	_meta?: IMetaInfo;
};
export interface SafeArrayGetCoefficient<T> {
	data: T[];
	_meta?: IMetaInfo;
}
export type ComplexArray<T = unknown> = T[] & {
	_meta?: IMetaInfo;
};
export interface SafeResponse<T> {
	data?: T;
}
