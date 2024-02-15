import { AbstractInputField } from '../../AbstractInputField';
import { type SvelteComponent } from 'svelte';
import SelectComponent from './SelectComponent.svelte';
import { type OptionInputFieldArgument } from '../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';

import { InputFieldArgumentType } from '../../../../config/FieldConfigs';
import { type MBLiteral, parseUnknownToLiteral } from '../../../../utils/Literal';

import { type IInputFieldBase } from '../../InputFieldBase';

export class SelectIPF extends AbstractInputField<MBLiteral, MBLiteral> {
	options: OptionInputFieldArgument[];

	constructor(renderChild: IInputFieldBase) {
		super(renderChild);

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
