import { NewAbstractInputField } from '../../NewAbstractInputField';
import { type moment } from 'obsidian';
import { type SvelteComponent } from 'svelte';
import { type InputFieldMDRC } from '../../../renderChildren/InputFieldMDRC';
import { parseUnknownToString } from '../../../utils/Utils';
import { DateParser } from '../../../parsers/DateParser';
import DateComponent from './DateComponent.svelte';

export class DateIPF extends NewAbstractInputField<string, moment.Moment> {
	constructor(renderChild: InputFieldMDRC) {
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
			useUsInputOrder: this.renderChild.plugin.settings.useUsDateInputOrder,
		};
	}
}
