import { AbstractInputField } from '../../AbstractInputField';
import { type MBLiteral, parseUnknownToLiteralArray } from '../../../../utils/Literal';
import { type InputFieldMDRC } from '../../../../renderChildren/InputFieldMDRC';
import { type SvelteComponent } from 'svelte';
import InlineListSuggesterComponent from './InlineListSuggesterComponent.svelte';
import { openSuggesterModalForInputField } from '../Suggester/SuggesterHelper';

export class InlineListSuggesterIPF extends AbstractInputField<MBLiteral[], MBLiteral[]> {
	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);
	}

	protected filterValue(value: unknown): MBLiteral[] | undefined {
		return parseUnknownToLiteralArray(value);
	}

	protected getFallbackDefaultValue(): MBLiteral[] {
		return [];
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		return InlineListSuggesterComponent;
	}

	protected rawMapValue(value: MBLiteral[]): MBLiteral[] {
		return value;
	}

	protected rawReverseMapValue(value: MBLiteral[]): MBLiteral[] | undefined {
		return value;
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			showSuggester: () => this.openModal(),
		};
	}

	openModal(): void {
		openSuggesterModalForInputField(this, selected => {
			const value = this.getInternalValue();
			value.push(selected.value);
			this.setInternalValue(value);
		});
	}
}
