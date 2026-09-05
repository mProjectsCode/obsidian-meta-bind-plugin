import { InputFieldArgumentType } from 'meta-bind-core/src/config/FieldConfigs';
import { AbstractInputField } from 'meta-bind-core/src/fields/inputFields/AbstractInputField';
import { openLinkTextEditingModal } from 'meta-bind-core/src/fields/inputFields/fields/Suggester/SuggesterHelper';
import type { InputFieldSvelteComponent } from 'meta-bind-core/src/fields/inputFields/InputFieldSvelteWrapper';
import type { MBLiteral } from 'meta-bind-core/src/utils/Literal';
import { parseUnknownToLiteral } from 'meta-bind-core/src/utils/Literal';
import SuggesterComponent from 'meta-bind-core/src/fields/inputFields/fields/Suggester/SuggesterComponent.svelte';

export class SuggesterIPF extends AbstractInputField<MBLiteral, MBLiteral> {
	protected filterValue(value: unknown): MBLiteral | undefined {
		return parseUnknownToLiteral(value);
	}

	protected getFallbackDefaultValue(): MBLiteral {
		return null;
	}

	protected getSvelteComponent(): InputFieldSvelteComponent<MBLiteral> {
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
			showTextPrompt: () => this.openTextModal(),
			editLinkText: () => this.openLinkTextEditor(),
			allowOther: this.mountable.getArgument(InputFieldArgumentType.ALLOW_OTHER)?.value === true,
		};
	}

	openModal(): void {
		this.mountable.mb.internal.openSuggesterModal(this, selected => this.setInternalValue(selected.value));
	}

	openTextModal(): void {
		this.mountable.mb.internal.openTextPromptModal({
			title: 'Meta Bind Suggester',
			subTitle: 'Set the suggester value.',
			value: '',
			multiline: false,
			onSubmit: (newValue: MBLiteral) => {
				this.setInternalValue(newValue);
			},
			onCancel: () => {},
		});
	}

	openLinkTextEditor(): void {
		const currentValue = this.getInternalValue();
		if (!currentValue || typeof currentValue !== 'string') {
			return;
		}

		openLinkTextEditingModal(
			currentValue,
			params => this.mountable.mb.internal.openTextPromptModal(params),
			updatedLink => {
				this.setInternalValue(updatedLink);
			},
		);
	}
}
