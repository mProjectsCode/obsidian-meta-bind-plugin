import type { ImageListSuggesterIPF } from 'meta-bind-core/src/fields/inputFields/fields/ImageListSuggester/ImageListSuggesterIPF';
import type { ImageSuggesterIPF } from 'meta-bind-core/src/fields/inputFields/fields/ImageSuggester/ImageSuggesterIPF';
import type { InlineListSuggesterIPF } from 'meta-bind-core/src/fields/inputFields/fields/InlineListSuggester/InlineListSuggesterIPF';
import type { ListSuggesterIPF } from 'meta-bind-core/src/fields/inputFields/fields/ListSuggester/ListSuggesterIPF';
import type { SuggesterIPF } from 'meta-bind-core/src/fields/inputFields/fields/Suggester/SuggesterIPF';
import { MDLinkParser } from 'meta-bind-core/src/parsers/MarkdownLinkParser';
import type { MBLiteral } from 'meta-bind-core/src/utils/Literal';

export type SuggesterLikeIFP = SuggesterIPF | ListSuggesterIPF | InlineListSuggesterIPF;

export type ImageSuggesterLikeIPF = ImageSuggesterIPF | ImageListSuggesterIPF;

/**
 * Callback signature for opening a text prompt modal.
 */
export type TextPromptModalCallback = (params: {
	title: string;
	subTitle: string;
	value: string;
	multiline: boolean;
	onSubmit: (value: MBLiteral) => void;
	onCancel: () => void;
}) => void;

export class SuggesterOption<T> {
	value: T;
	displayValue: string;
	displayDescription?: string;

	constructor(value: T, displayValue: string, displayDescription?: string) {
		this.value = value;
		this.displayValue = displayValue;
		this.displayDescription = displayDescription;
	}

	valueAsString(): string {
		return this.value?.toString() ?? 'null';
	}
}

/**
 * Opens a modal for editing the display text (alias) of a markdown/wiki link.
 *
 * @param currentLinkValue - The current link string to edit
 * @param openTextModal - Callback to open the text prompt modal
 * @param onLinkUpdated - Callback invoked with the updated link string when the user submits
 */
export function openLinkTextEditingModal(
	currentLinkValue: string,
	openTextModal: TextPromptModalCallback,
	onLinkUpdated: (updatedLink: string) => void,
): void {
	let linkText = '';
	try {
		if (MDLinkParser.isLink(currentLinkValue)) {
			const link = MDLinkParser.parseLink(currentLinkValue);
			linkText = link.alias ?? link.target;
		} else {
			linkText = currentLinkValue;
		}
	} catch (e) {
		console.warn('meta-bind | failed to parse link for editing', e);
		linkText = currentLinkValue;
	}

	openTextModal({
		title: 'Edit Link Text',
		subTitle: 'Modify the link display text.',
		value: linkText,
		multiline: false,
		onSubmit: (newLinkText: MBLiteral) => {
			if (typeof newLinkText !== 'string') {
				return;
			}

			try {
				if (MDLinkParser.isLink(currentLinkValue)) {
					const link = MDLinkParser.parseLink(currentLinkValue);
					link.alias = newLinkText;
					onLinkUpdated(link.toString());
				}
			} catch (e) {
				console.warn('meta-bind | failed to update link text', e);
			}
		},
		onCancel: () => {},
	});
}
