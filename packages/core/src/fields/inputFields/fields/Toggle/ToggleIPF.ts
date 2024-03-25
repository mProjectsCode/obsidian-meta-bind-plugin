import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import { type InputFieldMountable } from 'packages/core/src/fields/inputFields/InputFieldMountable';
import ToggleComponent from 'packages/core/src/fields/inputFields/fields/Toggle/ToggleComponent.svelte';
import { type MBLiteral, parseUnknownToLiteral } from 'packages/core/src/utils/Literal';
import { type SvelteComponent } from 'svelte';

export class ToggleIPF extends AbstractInputField<MBLiteral, boolean> {
	onValue: MBLiteral;
	offValue: MBLiteral;

	constructor(mountable: InputFieldMountable) {
		super(mountable);

		this.onValue = this.mountable.getArgument(InputFieldArgumentType.ON_VALUE)?.value ?? true;
		this.offValue = this.mountable.getArgument(InputFieldArgumentType.OFF_VALUE)?.value ?? false;
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
