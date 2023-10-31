import { AbstractInputField } from '../../AbstractInputField';
import { type Time, TimeParser } from '../../../parsers/TimeParser';
import { type SvelteComponent } from 'svelte';
import { type InputFieldMDRC } from '../../../renderChildren/InputFieldMDRC';
import { parseUnknownToString } from '../../../utils/Utils';
import TimeComponent from './TimeComponent.svelte';

export class TimeIPF extends AbstractInputField<string, Time> {
	constructor(renderChild: InputFieldMDRC) {
		super(renderChild);
	}

	protected filterValue(value: unknown): string | undefined {
		return parseUnknownToString(value);
	}

	protected getFallbackDefaultValue(): Time {
		return TimeParser.getDefaultTime();
	}

	protected getSvelteComponent(): typeof SvelteComponent {
		return TimeComponent;
	}

	protected rawMapValue(value: Time): string {
		return TimeParser.stringify(value);
	}

	protected rawReverseMapValue(value: string): Time | undefined {
		return TimeParser.parse(value);
	}
}
