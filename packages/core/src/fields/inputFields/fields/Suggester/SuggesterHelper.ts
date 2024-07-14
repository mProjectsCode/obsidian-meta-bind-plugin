import type { ImageListSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/ImageListSuggester/ImageListSuggesterIPF';
import type { ImageSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import type { InlineListSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/InlineListSuggester/InlineListSuggesterIPF';
import type { ListSuggesterIPF } from 'packages/core/src/fields/inputFields/fields/ListSuggester/ListSuggesterIPF';
import type { SuggesterIPF } from 'packages/core/src/fields/inputFields/fields/Suggester/SuggesterIPF';

export type SuggesterLikeIFP = SuggesterIPF | ListSuggesterIPF | InlineListSuggesterIPF;

export type ImageSuggesterLikeIPF = ImageSuggesterIPF | ImageListSuggesterIPF;

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
