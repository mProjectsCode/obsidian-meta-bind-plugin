import { NewAbstractInputField } from '../../NewAbstractInputField';
import { isLiteral, MBLiteral } from '../../../../utils/Utils';
import { OptionInputFieldArgument } from '../../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import { InputFieldMDRC } from '../../../../renderChildren/InputFieldMDRC';
import { InputFieldArgumentType } from '../../../../parsers/inputFieldParser/InputFieldConfigs';
import { SvelteComponent } from 'svelte';
import MultiSelectComponent from './MultiSelectComponent.svelte';

export class MultiSelectIPF extends NewAbstractInputField<MBLiteral[], MBLiteral[]> {
	options: OptionInputFieldArgument[];

	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);

		this.options = this.renderChild.getArguments(InputFieldArgumentType.OPTION) as OptionInputFieldArgument[];
	}

	protected filterValue(value: any): MBLiteral[] | undefined {
		if (value === null || value === undefined) {
			return undefined;
		} else if (Array.isArray(value)) {
			return value;
		} else {
			return [value];
		}
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

	protected getMountArgs(): Record<string, any> {
		return {
			options: this.options,
		};
	}
}
