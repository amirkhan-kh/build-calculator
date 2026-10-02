export interface FastApiValidationErrorItem {
	loc: (string | number)[];
	msg: string;
	type: string;
}

export interface FastApiErrorResponse {
	detail: string | FastApiValidationErrorItem[];
}
