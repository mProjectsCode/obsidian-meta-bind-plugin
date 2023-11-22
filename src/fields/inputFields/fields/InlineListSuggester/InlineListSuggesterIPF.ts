import { AbstractInputField } from '../../AbstractInputField';
import { type MBLiteral, parseUnknownToLiteralArray } from '../../../../utils/Literal';
import { type SvelteComponent } from 'svelte';
import InlineListSuggesterComponent from './InlineListSuggesterComponent.svelte';
import { type IInputFieldBase } from '../../IInputFieldBase';

export class InlineListSuggesterIPF extends AbstractInputField<MBLiteral[], MBLiteral[]> {
	constructor(renderChild: IInputFieldBase) {
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
		this.renderChild.plugin.internal.openSuggesterModal(this, selected => {
			const value = this.getInternalValue();
			value.push(selected.value);
			this.setInternalValue(value);
		});
	}
}
