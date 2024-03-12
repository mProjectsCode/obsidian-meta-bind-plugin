import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import ImageListSuggesterComponent from 'packages/core/src/fields/inputFields/fields/ImageListSuggester/ImageListSuggesterComponent.svelte';
import { type MBLiteral, parseUnknownToLiteralArray, stringifyLiteral } from 'packages/core/src/utils/Literal';
import { type SvelteComponent } from 'svelte';

export class ImageListSuggesterIPF extends AbstractInputField<MBLiteral[], string[]> {
	protected filterValue(value: unknown): MBLiteral[] | undefined {
		return parseUnknownToLiteralArray(value);
	}

	protected getFallbackDefaultValue(): string[] {
		return [];
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return ImageListSuggesterComponent;
	}

	protected rawMapValue(value: string[]): MBLiteral[] {
		return value;
	}

	protected rawReverseMapValue(value: MBLiteral[]): string[] | undefined {
		return value.map(v => stringifyLiteral(v)).filter(v => v !== undefined);
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			showSuggester: () => this.openModal(),
		};
	}

	openModal(): void {
		this.base.plugin.internal.openImageSuggesterModal(this, (selected: string) => {
			const value = this.getInternalValue();
			value.push(selected);
			this.setInternalValue(value);
		});
	}
}
