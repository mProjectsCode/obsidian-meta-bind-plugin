import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import { type OptionInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import { type InputFieldBase } from 'packages/core/src/fields/inputFields/InputFieldBase';
import MultiSelectComponent from 'packages/core/src/fields/inputFields/fields/MultiSelect/MultiSelectComponent.svelte';
import { type MBLiteral, parseUnknownToLiteralArray } from 'packages/core/src/utils/Literal';
import { type SvelteComponent } from 'svelte';

export class MultiSelectIPF extends AbstractInputField<MBLiteral[], MBLiteral[]> {
	options: OptionInputFieldArgument[];

	constructor(base: InputFieldBase) {
		super(base);

		this.options = this.base.getArguments(InputFieldArgumentType.OPTION);
	}

	protected filterValue(value: unknown): MBLiteral[] | undefined {
		return parseUnknownToLiteralArray(value);
	}

	protected getFallbackDefaultValue(): MBLiteral[] {
		return [];
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return MultiSelectComponent;
	}

	protected rawMapValue(value: MBLiteral[]): MBLiteral[] {
		return value;
	}

	protected rawReverseMapValue(value: MBLiteral[]): MBLiteral[] | undefined {
		return value;
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			options: this.options,
		};
	}
}
