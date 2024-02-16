import { AbstractInputField } from '../../AbstractInputField';
import { type SvelteComponent } from 'svelte';
import TextComponent from './TextComponent.svelte';
import { InputFieldArgumentType } from '../../../../config/FieldConfigs';
import { parseUnknownToString } from '../../../../utils/Literal';

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
