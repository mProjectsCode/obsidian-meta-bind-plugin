import { AbstractInputField } from '../../AbstractInputField';
import { type SvelteComponent } from 'svelte';
import NumberComponent from './NumberComponent.svelte';
import { InputFieldArgumentType } from '../../../../config/FieldConfigs';
import { parseUnknownToFloat } from '../../../../utils/Literal';
import { type IInputFieldBase } from '../../IInputFieldBase';

export class NumberIPF extends AbstractInputField<number, number> {
	constructor(renderChild: IInputFieldBase) {
		super(renderChild);
	}

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
