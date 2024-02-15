import { AbstractInputField } from '../../AbstractInputField';
import { type moment } from 'obsidian';
import { type SvelteComponent } from 'svelte';
import { DateParser } from '../../../../parsers/DateParser';
import DateComponent from './DateComponent.svelte';

import { type IInputFieldBase } from '../../InputFieldBase';

export class DateIPF extends AbstractInputField<string, moment.Moment> {
	constructor(renderChild: IInputFieldBase) {
		super(renderChild);
	}

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

	protected getFallbackDefaultValue(): moment.Moment {
		return DateParser.getDefaultDate();
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		// @ts-ignore
		return DateComponent;
	}

	protected rawMapValue(value: moment.Moment): string {
		return DateParser.stringify(value);
	}

	protected rawReverseMapValue(value: string): moment.Moment | undefined {
		return DateParser.parse(value);
	}

	protected getMountArgs(): Record<string, unknown> {
		return {
			useUsInputOrder: this.base.plugin.settings.useUsDateInputOrder,
		};
	}
}
