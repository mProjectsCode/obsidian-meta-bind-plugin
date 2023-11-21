import { AbstractInputField } from '../../AbstractInputField';
import { type InputFieldMDRC } from '../../../../renderChildren/InputFieldMDRC';
import { type SvelteComponent } from 'svelte';
import TextComponent from './TextComponent.svelte';

import { InputFieldArgumentType } from '../../../../config/FieldConfigs';
import { parseUnknownToString } from '../../../../utils/Literal';

export class TextIPF extends AbstractInputField<string, string> {
	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);
	}

	protected filterValue(value: unknown): string | undefined {
		return parseUnknownToString(value);
	}

	protected getFallbackDefaultValue(): string {
		return '';
	}

	protected getSvelteComponent(): typeof SvelteComponent {
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
			placeholder: this.renderChild.getArgument(InputFieldArgumentType.PLACEHOLDER)?.value ?? 'Text',
			limit: this.renderChild.getArgument(InputFieldArgumentType.LIMIT)?.value,
		};
	}
}
