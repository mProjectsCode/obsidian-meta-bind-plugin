import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import ProgressBarComponent from 'packages/core/src/fields/inputFields/fields/ProgressBar/ProgressBarComponent.svelte';
import type { InputFieldMountable } from 'packages/core/src/fields/inputFields/InputFieldMountable';
import type { InputFieldSvelteComponent } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
import { ErrorLevel, MetaBindArgumentError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { parseUnknownToFloat } from 'packages/core/src/utils/Literal';
import { optClamp } from 'packages/core/src/utils/Utils';

export class ProgressBarIPF extends AbstractInputField<number, number> {
	minValue: number;
	maxValue: number;
	stepSize: number;

	constructor(mountable: InputFieldMountable) {
		super(mountable);

		this.minValue = this.mountable.getArgument(InputFieldArgumentType.MIN_VALUE)?.value ?? 0;
		this.maxValue = this.mountable.getArgument(InputFieldArgumentType.MAX_VALUE)?.value ?? 100;
		this.stepSize = this.mountable.getArgument(InputFieldArgumentType.STEP_SIZE)?.value ?? 1;

		if (this.minValue >= this.maxValue) {
			throw new MetaBindArgumentError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not create progress bar input field',
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

	protected getSvelteComponent(): InputFieldSvelteComponent<number> {
		// @ts-ignore
		return ProgressBarComponent;
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
		};
	}
}
