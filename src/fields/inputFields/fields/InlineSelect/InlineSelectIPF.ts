import { AbstractInputField } from '../../AbstractInputField';
import { type OptionInputFieldArgument } from '../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import { type SvelteComponent } from 'svelte';
import InlineSelectComponent from './InlineSelectComponent.svelte';
import { InputFieldArgumentType } from '../../../../config/FieldConfigs';
import { type MBLiteral, parseUnknownToLiteral } from '../../../../utils/Literal';
import { type IInputFieldBase } from '../../IInputFieldBase';

export class InlineSelectIPF extends AbstractInputField<MBLiteral, MBLiteral> {
	options: OptionInputFieldArgument[];

	constructor(renderChild: IInputFieldBase) {
		super(renderChild);

		this.options = this.renderChild.getArguments(InputFieldArgumentType.OPTION);
	}

	protected filterValue(value: unknown): MBLiteral | undefined {
		return parseUnknownToLiteral(value);
	}

	protected getFallbackDefaultValue(): MBLiteral {
		return null;
	}

	protected getSvelteComponent(): typeof SvelteComponent {
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
