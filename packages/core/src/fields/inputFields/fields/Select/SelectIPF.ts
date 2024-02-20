import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import { type SvelteComponent } from 'svelte';
import SelectComponent from 'packages/core/src/fields/inputFields/fields/Select/SelectComponent.svelte';
import { type OptionInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import { type MBLiteral, parseUnknownToLiteral } from 'packages/core/src/utils/Literal';
import { type InputFieldBase } from 'packages/core/src/fields/inputFields/InputFieldBase';

export class SelectIPF extends AbstractInputField<MBLiteral, MBLiteral> {
	options: OptionInputFieldArgument[];

	constructor(base: InputFieldBase) {
		super(base);

		this.options = this.base.getArguments(InputFieldArgumentType.OPTION);
	}

	protected filterValue(value: unknown): MBLiteral | undefined {
		return parseUnknownToLiteral(value);
	}

	protected getFallbackDefaultValue(): MBLiteral {
		return null;
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return SelectComponent;
	}

	protected rawMapValue(value: MBLiteral): MBLiteral {
		return value;
	}

	protected rawReverseMapValue(value: MBLiteral): MBLiteral | undefined {
		return value;
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			options: this.options,
		};
	}
}
