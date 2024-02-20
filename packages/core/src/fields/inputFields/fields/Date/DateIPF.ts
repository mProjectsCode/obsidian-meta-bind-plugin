import { type Moment } from 'moment';
import { AbstractInputField } from 'packages/core/src/fields/inputFields/AbstractInputField';
import DateComponent from 'packages/core/src/fields/inputFields/fields/Date/DateComponent.svelte';
import { DateParser } from 'packages/core/src/parsers/DateParser';
import { type SvelteComponent } from 'svelte';

export class DateIPF extends AbstractInputField<string, Moment> {
	protected filterValue(value: unknown): string | undefined {
		if (value === null || value === undefined || typeof value !== 'string') {
			return undefined;
		}
		const date = DateParser.parse(value);
		if (date.isValid()) {
			return DateParser.stringify(date);
		} else {
			return undefined;
		}
	}

	protected getFallbackDefaultValue(): Moment {
		return DateParser.getDefaultDate();
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return DateComponent;
	}

	protected rawMapValue(value: Moment): string {
		return DateParser.stringify(value);
	}

	protected rawReverseMapValue(value: string): Moment | undefined {
		return DateParser.parse(value);
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			useUsInputOrder: this.base.plugin.settings.useUsDateInputOrder,
		};
	}
}
