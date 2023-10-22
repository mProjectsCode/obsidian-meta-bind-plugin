import { NewAbstractInputField } from '../../NewAbstractInputField';
import { clamp } from '../../../../utils/Utils';
import { type InputFieldMDRC } from '../../../../renderChildren/InputFieldMDRC';
import { type SvelteComponent } from 'svelte';
import SliderComponent from './SliderComponent.svelte';
import { InputFieldArgumentType } from '../../../../parsers/inputFieldParser/InputFieldConfigs';

export class SliderIPF extends NewAbstractInputField<number, number> {
	minValue: number;
	maxValue: number;

	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);

		this.minValue = this.renderChild.getArgument(InputFieldArgumentType.MIN_VALUE)?.value ?? 0;
		this.maxValue = this.renderChild.getArgument(InputFieldArgumentType.MAX_VALUE)?.value ?? 100;
	}

	protected filterValue(value: any): number | undefined {
		if (typeof value === 'number') {
			return clamp(value, this.minValue, this.maxValue);
		} else if (typeof value === 'string') {
			const v = Number.parseFloat(value);
			if (Number.isNaN(v)) {
				return undefined;
			} else {
				return clamp(v, this.minValue, this.maxValue);
			}
		} else {
			return undefined;
		}
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

	protected getMountArgs(): Record<string, any> {
		return {
			minValue: this.minValue,
			maxValue: this.maxValue,
			addLabels: this.renderChild.getArgument(InputFieldArgumentType.ADD_LABELS)?.value === true,
		};
	}
}
