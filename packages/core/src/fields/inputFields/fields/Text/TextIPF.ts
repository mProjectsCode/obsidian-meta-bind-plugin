import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import TextComponent from 'packages/core/src/fields/inputFields/fields/Text/TextComponent.svelte';
import { parseUnknownToString } from 'packages/core/src/utils/Literal';
import { type SvelteComponent } from 'svelte';

export class TextIPF extends AbstractInputField<string, string> {
	protected filterValue(value: unknown): string | undefined {
		return parseUnknownToString(value);
	}

	protected getFallbackDefaultValue(): string {
		return '';
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return TextComponent;
	}

	protected rawReverseMapValue(value: string): string | undefined {
		return value;
	}

	protected rawMapValue(value: string): string {
		return value;
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			placeholder: this.base.getArgument(InputFieldArgumentType.PLACEHOLDER)?.value ?? 'Text',
			limit: this.base.getArgument(InputFieldArgumentType.LIMIT)?.value,
		};
	}
}
