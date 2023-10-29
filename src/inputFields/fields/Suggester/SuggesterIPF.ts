import { NewAbstractInputField } from '../../NewAbstractInputField';
import { type MBLiteral, parseUnknownToLiteral } from '../../../utils/Utils';
import { type InputFieldMDRC } from '../../../renderChildren/InputFieldMDRC';
import { type SvelteComponent } from 'svelte';
import SuggesterComponent from './SuggesterComponent.svelte';
import { openSuggesterModalForInputField } from './SuggesterHelper';

export class SuggesterIPF extends NewAbstractInputField<MBLiteral, MBLiteral> {
	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);
	}

	protected filterValue(value: unknown): MBLiteral | undefined {
		return parseUnknownToLiteral(value);
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

	protected getMountArgs(): Record<string, unknown> {
		return {
			showSuggester: () => this.openModal(),
		};
	}

	openModal(): void {
		openSuggesterModalForInputField(this, selected => this.setInternalValue(selected.value));
	}
}
