import { type SuggesterIPF } from './SuggesterIPF';
import { type ListSuggesterIPF } from '../ListSuggester/ListSuggesterIPF';
import { type InlineListSuggesterIPF } from '../InlineListSuggester/InlineListSuggesterIPF';

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
