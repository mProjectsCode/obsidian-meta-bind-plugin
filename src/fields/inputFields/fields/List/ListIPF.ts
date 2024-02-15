import { AbstractInputField } from '../../AbstractInputField';
import { type SvelteComponent } from 'svelte';
import ListComponent from './ListComponent.svelte';
import { InputFieldArgumentType } from '../../../../config/FieldConfigs';
import { type MBLiteral, parseUnknownToLiteralArray } from '../../../../utils/Literal';

import { type IInputFieldBase } from '../../InputFieldBase';

export class ListIPF extends AbstractInputField<MBLiteral[], MBLiteral[]> {
	constructor(renderChild: IInputFieldBase) {
		super(renderChild);
	}

	protected filterValue(value: unknown): MBLiteral[] | undefined {
		return parseUnknownToLiteralArray(value);
	}

	protected getFallbackDefaultValue(): MBLiteral[] {
		return [];
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return ListComponent;
	}

	protected rawMapValue(value: MBLiteral[]): MBLiteral[] {
		return value;
	}

	protected rawReverseMapValue(value: MBLiteral[]): MBLiteral[] | undefined {
		return value;
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			placeholder: this.base.getArgument(InputFieldArgumentType.PLACEHOLDER)?.value ?? 'New Entry...',
			limit: this.base.getArgument(InputFieldArgumentType.LIMIT)?.value,
		};
	}
}
