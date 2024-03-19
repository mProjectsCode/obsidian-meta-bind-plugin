export class UserError extends Error {}

export interface ProjectConfig {
	corePackages: string[];
	packages: string[];
}
