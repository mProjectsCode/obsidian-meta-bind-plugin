import {
	type InputFieldArgumentType,
	type InputFieldType,
	type ViewFieldArgumentType,
	type ViewFieldType,
} from 'packages/core/src/config/FieldConfigs';
import { openURL } from 'packages/core/src/utils/Utils';

export class DocsUtils {
	static linkToInputField(type: InputFieldType): string {
		return `https://www.moritzjung.dev/obsidian-meta-bind-plugin-docs/reference/inputfields/${type.toLowerCase()}/`;
	}

	static linkToInputFieldArgument(type: InputFieldArgumentType): string {
		return `https://www.moritzjung.dev/obsidian-meta-bind-plugin-docs/reference/inputfieldarguments/${type.toLowerCase()}/`;
	}

	static linkToViewField(type: ViewFieldType): string {
		return `https://www.moritzjung.dev/obsidian-meta-bind-plugin-docs/reference/viewfields/${type.toLowerCase()}/`;
	}

	static linkToViewFieldArgument(type: ViewFieldArgumentType): string {
		return `https://www.moritzjung.dev/obsidian-meta-bind-plugin-docs/reference/viewfieldarguments/${type.toLowerCase()}/`;
	}

	static linkToInputFields(): string {
		return `https://www.moritzjung.dev/obsidian-meta-bind-plugin-docs/guides/inputfields/`;
	}

	static linkToViewFields(): string {
		return `https://www.moritzjung.dev/obsidian-meta-bind-plugin-docs/guides/viewfields/`;
	}

	static linkToButtons(): string {
		return `https://www.moritzjung.dev/obsidian-meta-bind-plugin-docs/guides/buttons/#button-configuration`;
	}

	static linkToButtonConfig(): string {
		return `https://www.moritzjung.dev/obsidian-meta-bind-plugin-docs/guides/buttons/#button-configuration`;
	}

	static linkToSearch(search: string): string {
		return `https://www.moritzjung.dev/obsidian-meta-bind-plugin-docs/?s=${encodeURIComponent(search)}`;
	}

	static linkToHome(): string {
		return `https://www.moritzjung.dev/obsidian-meta-bind-plugin-docs/`;
	}

	static linkToGithub(): string {
		return `https://github.com/mProjectsCode/obsidian-meta-bind-plugin`;
	}

	static linkToIssues(): string {
		return `https://github.com/mProjectsCode/obsidian-meta-bind-plugin/issues`;
	}

	static linkToCanaryBuilds(): string {
		return `https://www.moritzjung.dev/obsidian-meta-bind-plugin-docs/guides/installation/#canary-builds`;
	}

	static open(link: string): void {
		openURL(link);
	}
}
