import { NewAbstractInputField } from '../../NewAbstractInputField';
import { type MBLiteral, parseUnknownToLiteralArray } from '../../../../utils/Utils';
import { type OptionInputFieldArgument } from '../../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import { type InputFieldMDRC } from '../../../../renderChildren/InputFieldMDRC';
import { InputFieldArgumentType } from '../../../../parsers/inputFieldParser/InputFieldConfigs';
import { type SvelteComponent } from 'svelte';
import MultiSelectComponent from './MultiSelectComponent.svelte';

export class MultiSelectIPF extends NewAbstractInputField<MBLiteral[], MBLiteral[]> {
	options: OptionInputFieldArgument[];

	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);

		this.options = this.renderChild.getArguments(InputFieldArgumentType.OPTION);
	}

	protected filterValue(value: unknown): MBLiteral[] | undefined {
		return parseUnknownToLiteralArray(value);
	}

	protected getFallbackDefaultValue(): MBLiteral[] {
		return [];
	}

	protected getSvelteComponent(): typeof SvelteComponent {
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
