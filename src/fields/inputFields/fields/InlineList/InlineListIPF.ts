import { AbstractInputField } from '../../AbstractInputField';
import { type MBLiteral, parseUnknownToLiteralArray } from '../../../../utils/Literal';
import { type SvelteComponent } from 'svelte';
import InlineListComponent from './InlineListComponent.svelte';

export class InlineListIPF extends AbstractInputField<MBLiteral[], MBLiteral[]> {
	protected filterValue(value: unknown): MBLiteral[] | undefined {
		return parseUnknownToLiteralArray(value);
	}

	protected getFallbackDefaultValue(): MBLiteral[] {
		return [];
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return InlineListComponent;
	}

	protected rawMapValue(value: MBLiteral[]): MBLiteral[] {
		return value;
	}

	protected rawReverseMapValue(value: MBLiteral[]): MBLiteral[] | undefined {
		return value;
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			showInput: () => this.openModal(),
		};
	}

	openModal(): void {
		this.base.plugin.internal.openTextPromptModal(
			'',
			'Meta Bind List',
			'New List Element',
			'',
			newElement => {
				const value = this.getInternalValue();
				value.push(newElement);
				this.setInternalValue(value);
			},
			() => {},
		);
	}
}
