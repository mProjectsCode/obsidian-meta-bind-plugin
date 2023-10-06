import { NewAbstractInputField } from '../../NewAbstractInputField';
import { isLiteral, MBLiteral } from '../../../../utils/Utils';
import { InputFieldMDRC } from '../../../../renderChildren/InputFieldMDRC';
import { InputFieldArgumentType } from '../../../InputFieldConfigs';
import { SvelteComponent } from 'svelte';
import ToggleComponent from './ToggleComponent.svelte';

export class Toggle extends NewAbstractInputField<MBLiteral, boolean> {
	onValue: MBLiteral;
	offValue: MBLiteral;

	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);

		this.onValue = this.renderChild.getArgument(InputFieldArgumentType.ON_VALUE)?.value ?? true;
		this.offValue = this.renderChild.getArgument(InputFieldArgumentType.OFF_VALUE)?.value ?? false;
	}

	protected filterValue(value: any): MBLiteral | undefined {
		return isLiteral(value) ? value : undefined;
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
