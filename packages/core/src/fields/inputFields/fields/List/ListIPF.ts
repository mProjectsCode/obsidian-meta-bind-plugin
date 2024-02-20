import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import { type SvelteComponent } from 'svelte';
import ListComponent from 'packages/core/src/fields/inputFields/fields/List/ListComponent.svelte';
import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import { type MBLiteral, parseUnknownToLiteralArray } from 'packages/core/src/utils/Literal';

export class ListIPF extends AbstractInputField<MBLiteral[], MBLiteral[]> {
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
