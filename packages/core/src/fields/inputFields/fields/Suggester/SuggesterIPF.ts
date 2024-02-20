import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import { type SvelteComponent } from 'svelte';
import SuggesterComponent from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterComponent.svelte';
import { type MBLiteral, parseUnknownToLiteral } from 'packages/core/src/utils/Literal';

export class SuggesterIPF extends AbstractInputField<MBLiteral, MBLiteral> {
	protected filterValue(value: unknown): MBLiteral | undefined {
		return parseUnknownToLiteral(value);
	}

	protected getFallbackDefaultValue(): MBLiteral {
		return null;
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
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
		this.base.plugin.internal.openSuggesterModal(this, selected => this.setInternalValue(selected.value));
	}
}
