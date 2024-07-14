import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import type { OptionInputFieldArgument } from 'packages/core/src/fields/fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import InlineSelectComponent from 'packages/core/src/fields/inputFields/fields/InlineSelect/InlineSelectComponent.svelte';
import type { InputFieldMountable } from 'packages/core/src/fields/inputFields/InputFieldMountable';
import type { InputFieldSvelteComponent } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
import type { MBLiteral } from 'packages/core/src/utils/Literal';
import { parseUnknownToLiteral } from 'packages/core/src/utils/Literal';

export class InlineSelectIPF extends AbstractInputField<MBLiteral, MBLiteral> {
	options: OptionInputFieldArgument[];

	constructor(mountable: InputFieldMountable) {
		super(mountable);

		this.options = this.mountable.getArguments(InputFieldArgumentType.OPTION);
	}

	protected filterValue(value: unknown): MBLiteral | undefined {
		return parseUnknownToLiteral(value);
	}

	protected getFallbackDefaultValue(): MBLiteral {
		return null;
	}

	protected getSvelteComponent(): InputFieldSvelteComponent<MBLiteral> {
		// @ts-ignore
		return InlineSelectComponent;
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
