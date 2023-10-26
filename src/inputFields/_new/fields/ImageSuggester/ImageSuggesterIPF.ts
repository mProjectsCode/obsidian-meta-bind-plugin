import { NewAbstractInputField } from '../../NewAbstractInputField';
import { isLiteral, type MBLiteral, stringifyLiteral } from '../../../../utils/Utils';
import { type InputFieldMDRC } from '../../../../renderChildren/InputFieldMDRC';
import { type SvelteComponent } from 'svelte';
import ImageSuggesterComponent from './ImageSuggesterComponent.svelte';
import { openImageSuggesterModalForInputField } from './ImageSuggesterHelper';

export class ImageSuggesterIPF extends NewAbstractInputField<MBLiteral, string> {
	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);
	}

	protected filterValue(value: unknown): MBLiteral | undefined {
		return isLiteral(value) ? value : undefined;
	}

	protected getFallbackDefaultValue(): string {
		return '';
	}

	protected getSvelteComponent(): typeof SvelteComponent {
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
		openImageSuggesterModalForInputField(this, selected => this.setInternalValue(selected));
	}
}
