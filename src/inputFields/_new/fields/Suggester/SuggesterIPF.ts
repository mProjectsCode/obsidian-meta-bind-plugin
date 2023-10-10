import { NewAbstractInputField } from '../../NewAbstractInputField';
import { isLiteral, MBLiteral } from '../../../../utils/Utils';
import { OptionInputFieldArgument } from '../../../../inputFieldArguments/arguments/OptionInputFieldArgument';
import { InputFieldMDRC } from '../../../../renderChildren/InputFieldMDRC';
import { InputFieldArgumentType } from '../../../InputFieldConfigs';
import { SvelteComponent } from 'svelte';
import SuggesterComponent from './SuggesterComponent.svelte';
import { openSuggesterModalForInputField } from './SuggesterHelper';

export class SuggesterIPF extends NewAbstractInputField<MBLiteral, MBLiteral> {
	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);
	}

	protected filterValue(value: any): MBLiteral | undefined {
		return isLiteral(value) ? value : undefined;
	}

	protected getFallbackDefaultValue(): MBLiteral {
		return null;
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		return SuggesterComponent;
	}

	protected rawMapValue(value: MBLiteral): MBLiteral {
		return value;
	}

	protected rawReverseMapValue(value: MBLiteral): MBLiteral | undefined {
		return value;
	}

	protected getMountArgs(): Record<string, any> {
		return {
			showSuggester: () => this.openModal(),
		};
	}

	openModal(): void {
		openSuggesterModalForInputField(this, selected => this.setInternalValue(selected.value));
	}
}
