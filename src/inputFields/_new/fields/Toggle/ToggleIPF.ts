import { NewAbstractInputField } from '../../NewAbstractInputField';
import { type MBLiteral, parseUnknownToLiteral } from '../../../../utils/Utils';
import { type InputFieldMDRC } from '../../../../renderChildren/InputFieldMDRC';
import { InputFieldArgumentType } from '../../../../parsers/inputFieldParser/InputFieldConfigs';
import { type SvelteComponent } from 'svelte';
import ToggleComponent from './ToggleComponent.svelte';

export class ToggleIPF extends NewAbstractInputField<MBLiteral, boolean> {
	onValue: MBLiteral;
	offValue: MBLiteral;

	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);

		this.onValue = this.renderChild.getArgument(InputFieldArgumentType.ON_VALUE)?.value ?? true;
		this.offValue = this.renderChild.getArgument(InputFieldArgumentType.OFF_VALUE)?.value ?? false;
	}

	protected filterValue(value: unknown): MBLiteral | undefined {
		return parseUnknownToLiteral(value);
	}

	protected getFallbackDefaultValue(): boolean {
		return false;
	}

	protected getSvelteComponent(): typeof SvelteComponent {
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
