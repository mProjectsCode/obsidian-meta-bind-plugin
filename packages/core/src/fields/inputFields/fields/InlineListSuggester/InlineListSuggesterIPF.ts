import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import InlineListSuggesterComponent from 'packages/core/src/fields/inputFields/fields/InlineListSuggester/InlineListSuggesterComponent.svelte';
import { type MBLiteral, parseUnknownToLiteralArray } from 'packages/core/src/utils/Literal';
import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import type { InputFieldSvelteComponent } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';

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
			allowsOther: this.mountable.getArgument(InputFieldArgumentType.ALLOW_OTHER)?.value === true,
		};
	}

	openModal(): void {
		this.mountable.plugin.internal.openSuggesterModal(this, selected => {
			this.svelteWrapper.getInstance()?.pushValue(selected.value);
		});
	}

	openTextModal(): void {
		this.mountable.plugin.internal.openTextPromptModal({
			title: 'Meta Bind List Suggester',
			subTitle: 'Create a new List Element.',
			value: '',
			multiline: false,
			onSubmit: (newElement: MBLiteral) => {
				this.svelteWrapper.getInstance()?.pushValue(newElement);
			},
			onCancel: () => {},
		});
	}
}
