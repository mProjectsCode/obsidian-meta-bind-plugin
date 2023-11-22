import { AbstractInputField } from '../../AbstractInputField';
import { type moment } from 'obsidian';
import { type SvelteComponent } from 'svelte';
import { DateParser } from '../../../../parsers/DateParser';
import DateComponent from './DateComponent.svelte';
import { parseUnknownToString } from '../../../../utils/Literal';
import { type IInputFieldBase } from '../../IInputFieldBase';

export class DateIPF extends AbstractInputField<string, moment.Moment> {
	constructor(renderChild: IInputFieldBase) {
		super(renderChild);
	}

	protected filterValue(value: unknown): string | undefined {
		return parseUnknownToString(value);
	}

	protected getFallbackDefaultValue(): moment.Moment {
		return DateParser.getDefaultDate();
	}

	protected getSvelteComponent(): typeof SvelteComponent {
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
