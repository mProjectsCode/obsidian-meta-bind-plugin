import { NewAbstractInputField } from '../../NewAbstractInputField';
import { isLiteral, MBLiteral } from '../../../../utils/Utils';
import { InputFieldMDRC } from '../../../../renderChildren/InputFieldMDRC';
import { SvelteComponent } from 'svelte';
import SelectComponent from './SelectComponent.svelte';
import { OptionInputFieldArgument } from '../../../../fieldArguments/inputFieldArguments/arguments/OptionInputFieldArgument';
import { InputFieldArgumentType } from '../../../../parsers/inputFieldParser/InputFieldConfigs';

export class SelectIPF extends NewAbstractInputField<MBLiteral, MBLiteral> {
	options: OptionInputFieldArgument[];

	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);

		this.options = this.renderChild.getArguments(InputFieldArgumentType.OPTION) as OptionInputFieldArgument[];
	}

	protected filterValue(value: any): MBLiteral | undefined {
		return isLiteral(value) ? value : undefined;
	}

	protected getFallbackDefaultValue(): MBLiteral {
		return null;
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		return SelectComponent;
	}

	protected rawMapValue(value: MBLiteral): MBLiteral {
		return value;
	}

	protected rawReverseMapValue(value: MBLiteral): MBLiteral | undefined {
		return value;
	}

	protected getMountArgs(): Record<string, any> {
		return {
			options: this.options,
		};
	}
}