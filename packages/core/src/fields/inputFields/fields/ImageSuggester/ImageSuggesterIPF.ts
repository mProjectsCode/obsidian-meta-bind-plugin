import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import ImageSuggesterComponent from 'packages/core/src/fields/inputFields/fields/ImageSuggester/ImageSuggesterComponent.svelte';
import type { InputFieldSvelteComponent } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
import type { MBLiteral } from 'packages/core/src/utils/Literal';
import { isLiteral, stringifyLiteral } from 'packages/core/src/utils/Literal';

export class ImageSuggesterIPF extends AbstractInputField<MBLiteral, string | undefined> {
	protected filterValue(value: unknown): MBLiteral | undefined {
		return isLiteral(value) ? value : undefined;
	}

	protected getFallbackDefaultValue(): string | undefined {
		return undefined;
	}

	protected getSvelteComponent(): InputFieldSvelteComponent<string | undefined> {
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
			clear: () => this.setInternalValue(undefined),
		};
	}

	openModal(): void {
		this.mountable.plugin.internal.openImageSuggesterModal(this, true, (selected: string | undefined) =>
			this.setInternalValue(selected),
		);
	}
}
