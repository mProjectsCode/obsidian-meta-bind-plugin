import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import DateComponent from 'packages/core/src/fields/inputFields/fields/Date/DateComponent.svelte';
import type { InputFieldSvelteComponent } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
import { DateParser } from 'packages/core/src/parsers/DateParser';
import { parseUnknownToString } from 'packages/core/src/utils/Literal';

export class DateIPF extends AbstractInputField<string, string> {
	protected filterValue(value: unknown): string | undefined {
		return parseUnknownToString(value);
	}

	protected getFallbackDefaultValue(): string {
		return DateParser.stringify(DateParser.getDefaultDate());
	}

	protected getSvelteComponent(): InputFieldSvelteComponent<string> {
		// @ts-ignore
		return DateComponent;
	}

	protected rawMapValue(value: string): string {
		return value;
	}

	protected rawReverseMapValue(value: string): string | undefined {
		return value;
	}
}
