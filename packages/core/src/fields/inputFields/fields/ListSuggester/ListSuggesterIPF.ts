import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import ListSuggesterComponent from 'packages/core/src/fields/inputFields/fields/ListSuggester/ListSuggesterComponent.svelte';
import { type MBLiteral, parseUnknownToLiteralArray } from 'packages/core/src/utils/Literal';
import { type SvelteComponent } from 'svelte';

export class ListSuggesterIPF extends AbstractInputField<MBLiteral[], MBLiteral[]> {
	protected filterValue(value: unknown): MBLiteral[] | undefined {
		return parseUnknownToLiteralArray(value);
	}

	protected getFallbackDefaultValue(): MBLiteral[] {
		return [];
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return ListSuggesterComponent;
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
		this.base.plugin.internal.openSuggesterModal(this, selected => {
			const value = this.getInternalValue();
			value.push(selected.value);
			this.setInternalValue(value);
		});
	}
}
