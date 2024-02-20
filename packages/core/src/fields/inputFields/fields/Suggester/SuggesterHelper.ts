import { type InlineListSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/InlineListSuggester/InlineListSuggesterIPF';
import { type ListSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/ListSuggester/ListSuggesterIPF';
import { type SuggesterIPF } from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterIPF';

export type SuggesterLikeIFP = SuggesterIPF | ListSuggesterIPF | InlineListSuggesterIPF;

export class SuggesterOption<T> {
	value: T;
	displayValue: string;

	constructor(value: T, displayValue: string) {
		this.value = value;
		this.displayValue = displayValue;
	}

	valueAsString(): string {
		return this.value?.toString() ?? 'null';
	}
}
