import { AbstractInputField } from '../../AbstractInputField';
import { type SvelteComponent } from 'svelte';
import SuggesterComponent from './SuggesterComponent.svelte';
import { type MBLiteral, parseUnknownToLiteral } from '../../../../utils/Literal';
import { type IInputFieldBase } from '../../IInputFieldBase';

export class SuggesterIPF extends AbstractInputField<MBLiteral, MBLiteral> {
	constructor(renderChild: IInputFieldBase) {
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
		this.renderChild.plugin.internal.openSuggesterModal(this, selected => this.setInternalValue(selected.value));
	}
}
