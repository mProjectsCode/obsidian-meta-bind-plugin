import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import { type SvelteComponent } from 'svelte';
import NumberComponent from 'packages/core/src/fields/inputFields/fields/Number/NumberComponent.svelte';
import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import { parseUnknownToFloat } from 'packages/core/src/utils/Literal';

export class NumberIPF extends AbstractInputField<number, number> {
	protected filterValue(value: unknown): number | undefined {
		return parseUnknownToFloat(value);
	}

	protected getFallbackDefaultValue(): number {
		return 0;
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return NumberComponent;
	}

	protected rawReverseMapValue(value: number): number | undefined {
		return value;
	}

	protected rawMapValue(value: number): number {
		return value;
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			placeholder: this.base.getArgument(InputFieldArgumentType.PLACEHOLDER) ?? 'Number',
		};
	}
}
