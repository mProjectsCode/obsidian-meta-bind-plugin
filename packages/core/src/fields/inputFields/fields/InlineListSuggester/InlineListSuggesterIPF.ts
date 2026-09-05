import { InputFieldArgumentType } from 'meta-bind-core/src/config/FieldConfigs';
import { AbstractInputField } from 'meta-bind-core/src/fields/inputFields/AbstractInputField';
import { openLinkTextEditingModal } from 'meta-bind-core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import type { InputFieldSvelteComponent } from 'meta-bind-core/src/fields/inputFields/InputFieldSvelteWrapper';
import type { MBLiteral } from 'meta-bind-core/src/utils/Literal';
import { parseUnknownToLiteralArray } from 'meta-bind-core/src/utils/Literal';
import InlineListSuggesterComponent from 'meta-bind-core/src/fields/inputFields/fields/InlineListSuggester/InlineListSuggesterComponent.svelte';

interface SvelteExports {
	pushValue: (value: MBLiteral) => void;
}

export class InlineListSuggesterIPF extends AbstractInputField<MBLiteral[], MBLiteral[], SvelteExports> {
	protected filterValue(value: unknown): MBLiteral[] | undefined {
		return parseUnknownToLiteralArray(value);
	}

	protected getFallbackDefaultValue(): MBLiteral[] {
		return [];
	}

	protected getSvelteComponent(): InputFieldSvelteComponent<MBLiteral[], SvelteExports> {
		// @ts-ignore
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
			showTextPrompt: () => this.openTextModal(),
			editLinkText: (index: number, value: MBLiteral) => this.openLinkTextEditor(index, value),
			allowOther: this.mountable.getArgument(InputFieldArgumentType.ALLOW_OTHER)?.value === true,
		};
	}

	openModal(): void {
		this.mountable.mb.internal.openSuggesterModal(this, selected => {
			this.svelteWrapper?.getInstance()?.pushValue(selected.value);
		});
	}

	openTextModal(): void {
		this.mountable.mb.internal.openTextPromptModal({
			title: 'Meta Bind List Suggester',
			subTitle: 'Create a new List Element.',
			value: '',
			multiline: false,
			onSubmit: (newElement: MBLiteral) => {
				this.svelteWrapper?.getInstance()?.pushValue(newElement);
			},
			onCancel: () => {},
		});
	}

	openLinkTextEditor(index: number, linkValue: MBLiteral): void {
		if (typeof linkValue !== 'string') {
			return;
		}

		// Validate that the index is within bounds
		const currentValue = this.getInternalValue();
		if (!Array.isArray(currentValue) || index < 0 || index >= currentValue.length) {
			return;
		}

		const currentLink = linkValue;

		openLinkTextEditingModal(
			currentLink,
			params => this.mountable.mb.internal.openTextPromptModal(params),
			updatedLink => {
				// Re-check the value, since the list may have changed (e.g. reordered or an
				// item removed) while the modal was open.
				const latestValue = this.getInternalValue();
				if (!Array.isArray(latestValue) || latestValue[index] !== currentLink) {
					return;
				}

				const updatedArray = [...latestValue];
				updatedArray[index] = updatedLink;
				this.setInternalValue(updatedArray);
			},
		);
	}
}
