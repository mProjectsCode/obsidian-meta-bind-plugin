import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import InlineListComponent from 'packages/core/src/fields/inputFields/fields/InlineList/InlineListComponent.svelte';
import { type MBLiteral, parseUnknownToLiteralArray } from 'packages/core/src/utils/Literal';
import { type SvelteComponent } from 'svelte';

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
		this.mountable.plugin.internal.openTextPromptModal({
			title: 'Meta Bind List',
			subTitle: 'Create a new List Element.',
			value: '',
			multiline: false,
			onSubmit: (newElement: MBLiteral) => {
				const value = this.getInternalValue();
				value.push(newElement);
				this.setInternalValue(value);
			},
			onCancel: () => {},
		});
	}
}
