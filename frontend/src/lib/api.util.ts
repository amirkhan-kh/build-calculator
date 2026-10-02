export const createSearchParams = (params: Record<string, unknown>) => {
	const searchparams = new URLSearchParams();
	for (const key in params) {
		if (
			params[key] !== undefined &&
			params[key] !== null &&
			params[key] !== ""
		) {
			searchparams.set(key, `${params[key]}`);
		}
	}
	return searchparams;
};
