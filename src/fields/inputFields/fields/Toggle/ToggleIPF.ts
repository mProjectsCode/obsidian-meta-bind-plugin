import { AbstractInputField } from '../../AbstractInputField';
import { type SvelteComponent } from 'svelte';
import ToggleComponent from './ToggleComponent.svelte';
import { InputFieldArgumentType } from '../../../../config/FieldConfigs';
import { type MBLiteral, parseUnknownToLiteral } from '../../../../utils/Literal';

import { type IInputFieldBase } from '../../InputFieldBase';

export class ToggleIPF extends AbstractInputField<MBLiteral, boolean> {
	onValue: MBLiteral;
	offValue: MBLiteral;

	constructor(renderChild: IInputFieldBase) {
		super(renderChild);

		this.onValue = this.base.getArgument(InputFieldArgumentType.ON_VALUE)?.value ?? true;
		this.offValue = this.base.getArgument(InputFieldArgumentType.OFF_VALUE)?.value ?? false;
	}

	protected filterValue(value: unknown): MBLiteral | undefined {
		return value === this.onValue || value === this.offValue ? parseUnknownToLiteral(value) : undefined;
	}

	protected getFallbackDefaultValue(): boolean {
		return false;
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return ToggleComponent;
	}

	protected rawReverseMapValue(value: MBLiteral): boolean | undefined {
		if (value === this.onValue) {
			return true;
		} else if (value === this.offValue) {
			return false;
		} else {
			return false;
		}
	}

	protected rawMapValue(value: boolean): MBLiteral {
		return value ? this.onValue : this.offValue;
	}
}
