import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import TextAreaComponent from 'packages/core/src/fields/inputFields/fields/TextArea/TextAreaComponent.svelte';
import { parseUnknownToString } from 'packages/core/src/utils/Literal';
import type { InputFieldSvelteComponent } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';

export class TextAreaIPF extends AbstractInputField<string, string> {
	protected filterValue(value: unknown): string | undefined {
		return parseUnknownToString(value);
	}

	protected getFallbackDefaultValue(): string {
		return '';
	}

	protected getSvelteComponent(): InputFieldSvelteComponent<string> {
		// @ts-ignore
		return TextAreaComponent;
	}

	protected rawReverseMapValue(value: string): string | undefined {
		return value;
	}

	protected rawMapValue(value: string): string {
		return value;
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			placeholder: this.mountable.getArgument(InputFieldArgumentType.PLACEHOLDER)?.value ?? 'Text',
			limit: this.mountable.getArgument(InputFieldArgumentType.LIMIT)?.value,
		};
	}
}
