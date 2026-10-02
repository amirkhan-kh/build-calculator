export const QueryKeys = {
	apartments: {
		all: ["apartments"] as const,
		lists: () => [...QueryKeys.apartments.all, "list"] as const,
		list: (filters: string) =>
			[...QueryKeys.apartments.lists(), { filters }] as const,
		details: () => [...QueryKeys.apartments.all, "detail"] as const,
		detail: (id: string | number) =>
			[...QueryKeys.apartments.details(), id] as const,
	},
	buildings: {
		all: ["buildings"] as const,
		lists: () => [...QueryKeys.buildings.all, "list"] as const,
		list: (filters: string) =>
			[...QueryKeys.buildings.lists(), { filters }] as const,
		details: () => [...QueryKeys.buildings.all, "detail"] as const,
		detail: (id: string | number) =>
			[...QueryKeys.buildings.details(), id] as const,
	},
	complex: {
		all: ["complex"] as const,
		lists: () => [...QueryKeys.complex.all, "list"] as const,
		list: (filters: string) =>
			[...QueryKeys.complex.lists(), { filters }] as const,
		details: () => [...QueryKeys.complex.all, "detail"] as const,
		detail: (id: string | number) =>
			[...QueryKeys.complex.details(), id] as const,
	},
	coefficients: {
		all: ["coefficients"] as const,
		lists: () => [...QueryKeys.coefficients.all, "list"] as const,
		list: (filters: string) =>
			[...QueryKeys.coefficients.lists(), { filters }] as const,
		details: () => [...QueryKeys.coefficients.all, "detail"] as const,
		detail: (id: string | number) =>
			[...QueryKeys.coefficients.details(), id] as const,
	},
	coefficientTypes: {
		all: ["coefficientTypes"] as const,
		lists: () => [...QueryKeys.coefficientTypes.all, "list"] as const,
		list: (filters: string) =>
			[...QueryKeys.coefficientTypes.lists(), { filters }] as const,
		details: () => [...QueryKeys.coefficientTypes.all, "detail"] as const,
		detail: (id: string | number) =>
			[...QueryKeys.coefficientTypes.details(), id] as const,
		byBuilding: (buildingId: number) =>
			[...QueryKeys.coefficientTypes.all, "building", buildingId] as const,
	},
	permissions: {
		all: ["permissions"] as const,
		lists: () => [...QueryKeys.permissions.all, "list"] as const,
		list: (filters: string | Record<string, unknown>) =>
			[...QueryKeys.permissions.lists(), { filters }] as const,
		details: () => [...QueryKeys.permissions.all, "detail"] as const,
		detail: (id: string | number) =>
			[...QueryKeys.permissions.details(), id] as const,
	},
	roles: {
		all: ["roles"] as const,
		lists: () => [...QueryKeys.roles.all, "list"] as const,
		list: (filters: string | Record<string, unknown>) =>
			[...QueryKeys.roles.lists(), { filters }] as const,
		details: () => [...QueryKeys.roles.all, "detail"] as const,
		detail: (id: string | number) =>
			[...QueryKeys.roles.details(), id] as const,
	},
	firms: {
		all: ["firms"] as const,
		lists: () => [...QueryKeys.firms.all, "list"] as const,
		list: (filters: string | Record<string, unknown>) =>
			[...QueryKeys.firms.lists(), { filters }] as const,
	},
	users: {
		all: ["users"] as const,
		lists: () => [...QueryKeys.users.all, "list"] as const,
		list: (filters: string | Record<string, unknown>) =>
			[...QueryKeys.users.lists(), { filters }] as const,
		details: () => [...QueryKeys.users.all, "detail"] as const,
		detail: (id: string | number) =>
			[...QueryKeys.users.details(), id] as const,
	},
};
