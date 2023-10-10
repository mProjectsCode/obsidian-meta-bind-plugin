import { NewAbstractInputField } from '../../NewAbstractInputField';
import { InputFieldMDRC } from '../../../../renderChildren/InputFieldMDRC';
import { SvelteComponent } from 'svelte';
import NumberComponent from './NumberComponent.svelte';
import { InputFieldArgumentType } from '../../../InputFieldConfigs';

export class NumberIPF extends NewAbstractInputField<number, number> {
	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);
	}

	protected filterValue(value: any): number | undefined {
		if (typeof value === 'number') {
			return value;
		} else if (typeof value === 'string') {
			const v = Number.parseFloat(value);
			if (Number.isNaN(v)) {
				return undefined;
			} else {
				return v;
			}
		} else {
			return undefined;
		}
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

	protected getMountArgs(): Record<string, any> {
		return {
			placeholder: this.renderChild.getArgument(InputFieldArgumentType.PLACEHOLDER)?.value ?? 'Number',
		};
	}
}
