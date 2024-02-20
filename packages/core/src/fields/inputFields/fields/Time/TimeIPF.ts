import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import { type Time, TimeParser } from 'packages/core/src/parsers/TimeParser';
import { type SvelteComponent } from 'svelte';
import TimeComponent from 'packages/core/src/fields/inputFields/fields/Time/TimeComponent.svelte';
import { parseUnknownToString } from 'packages/core/src/utils/Literal';

export class TimeIPF extends AbstractInputField<string, Time> {
	protected filterValue(value: unknown): string | undefined {
		const strValue = parseUnknownToString(value);
		return TimeParser.parse(strValue) ? strValue : undefined;
	}

	protected getFallbackDefaultValue(): Time {
		return TimeParser.getDefaultTime();
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return TimeComponent;
	}

	protected rawMapValue(value: Time): string {
		return TimeParser.stringify(value);
	}

	protected rawReverseMapValue(value: string): Time | undefined {
		return TimeParser.parse(value);
	}
}
