import { type InputFieldArgumentType, type InputFieldType, type ViewFieldArgumentType, type ViewFieldType } from '../parsers/GeneralConfigs';

export class DocsHelper {
	static linkToInputField(type: InputFieldType): string {
		return `https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/reference/inputfields/${type.toLowerCase()}/`;
	}

	static linkToInputFieldArgument(type: InputFieldArgumentType): string {
		return `https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/reference/inputfieldarguments/${type.toLowerCase()}/`;
	}

	static linkToViewField(type: ViewFieldType): string {
		return `https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/reference/viewfields/${type.toLowerCase()}/`;
	}

	static linkToViewFieldArgument(type: ViewFieldArgumentType): string {
		return `https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/reference/viewfieldarguments/${type.toLowerCase()}/`;
	}

	static linkToInputFields(): string {
		return `https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/guides/inputfields/`;
	}

	static linkToViewFields(): string {
		return `https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/guides/viewfields/`;
	}

	static linkToSearch(search: string): string {
		return `https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/?s=${encodeURIComponent(search)}`;
	}

	static linkToHome(): string {
		return `https://mprojectscode.github.io/obsidian-meta-bind-plugin-docs/`;
	}

	static linkToGithub(): string {
		return `https://github.com/mProjectsCode/obsidian-meta-bind-plugin`;
	}

	static linkToIssues(): string {
		return `https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues`;
	}

	static open(link: string): void {
		window.open(link, '_blank');
	}
}
