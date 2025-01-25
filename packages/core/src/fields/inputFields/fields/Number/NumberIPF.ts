import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import NumberComponent from 'packages/core/src/fields/inputFields/fields/Number/NumberComponent.svelte';
import type { InputFieldSvelteComponent } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
import { parseUnknownToFloat } from 'packages/core/src/utils/Literal';

export class NumberIPF extends AbstractInputField<number | null, number | null> {
	protected filterValue(value: unknown): number | null | undefined {
		return parseUnknownToFloat(value);
	}

	protected getFallbackDefaultValue(): number | null {
		return null;
	}

	protected getSvelteComponent(): InputFieldSvelteComponent<number | null> {
		// @ts-ignore
		return NumberComponent;
	}

	protected rawReverseMapValue(value: number | null): number | null | undefined {
		return value;
	}

	protected rawMapValue(value: number | null): number | null {
		return value;
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			placeholder: this.mountable.getArgument(InputFieldArgumentType.PLACEHOLDER)?.value ?? 'Number',
		};
	}
}
