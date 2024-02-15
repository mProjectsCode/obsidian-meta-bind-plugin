import { AbstractInputField } from '../../AbstractInputField';
import { type SvelteComponent } from 'svelte';
import ImageSuggesterComponent from './ImageSuggesterComponent.svelte';
import { isLiteral, type MBLiteral, stringifyLiteral } from '../../../../utils/Literal';

import { type IInputFieldBase } from '../../InputFieldBase';

export class ImageSuggesterIPF extends AbstractInputField<MBLiteral, string> {
	constructor(renderChild: IInputFieldBase) {
		super(renderChild);
	}

	protected filterValue(value: unknown): MBLiteral | undefined {
		return isLiteral(value) ? value : undefined;
	}

	protected getFallbackDefaultValue(): string {
		return '';
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return ImageSuggesterComponent;
	}

	protected rawMapValue(value: string): MBLiteral {
		return value;
	}

	protected rawReverseMapValue(value: MBLiteral): string | undefined {
		return stringifyLiteral(value);
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			showSuggester: () => this.openModal(),
		};
	}

	openModal(): void {
		this.base.plugin.internal.openImageSuggesterModal(this, selected => this.setInternalValue(selected));
	}
}
