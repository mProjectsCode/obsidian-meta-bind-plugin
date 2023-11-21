import { AbstractInputField } from '../../AbstractInputField';
import { type InputFieldMDRC } from '../../../../renderChildren/InputFieldMDRC';
import { type SvelteComponent } from 'svelte';
import NumberComponent from './NumberComponent.svelte';
import { InputFieldArgumentType } from '../../../../config/FieldConfigs';
import { parseUnknownToFloat } from '../../../../utils/Literal';

export class NumberIPF extends AbstractInputField<number, number> {
	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);
	}

	protected filterValue(value: unknown): number | undefined {
		return parseUnknownToFloat(value);
	}

	protected getFallbackDefaultValue(): number {
		return 0;
	}

	protected getSvelteComponent(): typeof SvelteComponent {
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
			placeholder: this.renderChild.getArgument(InputFieldArgumentType.PLACEHOLDER) ?? 'Number',
		};
	}
}
