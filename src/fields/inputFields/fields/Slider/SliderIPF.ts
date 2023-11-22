import { AbstractInputField } from '../../AbstractInputField';
import { optClamp } from '../../../../utils/Utils';
import { type SvelteComponent } from 'svelte';
import SliderComponent from './SliderComponent.svelte';
import { ErrorLevel, MetaBindArgumentError } from '../../../../utils/errors/MetaBindErrors';
import { InputFieldArgumentType } from '../../../../config/FieldConfigs';
import { parseUnknownToFloat } from '../../../../utils/Literal';
import { type IInputFieldBase } from '../../IInputFieldBase';

export class SliderIPF extends AbstractInputField<number, number> {
	minValue: number;
	maxValue: number;
	stepSize: number;

	constructor(renderChild: IInputFieldBase) {
		super(renderChild);

		// FIXME: Check that minvalue < maxvalue.
		this.minValue = this.base.getArgument(InputFieldArgumentType.MIN_VALUE)?.value ?? 0;
		this.maxValue = this.base.getArgument(InputFieldArgumentType.MAX_VALUE)?.value ?? 100;
		this.stepSize = this.base.getArgument(InputFieldArgumentType.STEP_SIZE)?.value ?? 1;

		if (this.minValue >= this.maxValue) {
			throw new MetaBindArgumentError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create slider input field',
				cause: `minValue (${this.maxValue}) must be less than maxValue (${this.maxValue})`,
			});
		}
	}

	protected filterValue(value: unknown): number | undefined {
		return optClamp(parseUnknownToFloat(value), this.minValue, this.maxValue);
	}

	protected getFallbackDefaultValue(): number {
		return this.minValue;
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		return SliderComponent;
	}

	protected rawReverseMapValue(value: number): number | undefined {
		return value;
	}

	protected rawMapValue(value: number): number {
		return value;
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			minValue: this.minValue,
			maxValue: this.maxValue,
			stepSize: this.stepSize,
			addLabels: this.base.getArgument(InputFieldArgumentType.ADD_LABELS)?.value === true,
		};
	}
}
