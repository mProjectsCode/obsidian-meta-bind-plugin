import type { MetaBind } from 'packages/core/src';
import {
	type ButtonClickContext,
	type ButtonConfig,
	type ButtonContext,
	type OpenButtonAction,
	ButtonPaneType,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import { MDLinkParser } from 'packages/core/src/parsers/MarkdownLinkParser';
import Button from 'packages/core/src/utils/components/Button.svelte';

export class OpenButtonActionConfig extends AbstractButtonActionConfig<OpenButtonAction> {
	constructor(mb: MetaBind) {
		super(ButtonActionType.OPEN, mb);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: OpenButtonAction,
		filePath: string,
		_context: ButtonContext,
		click: ButtonClickContext,
	): Promise<void> {
		const link = MDLinkParser.interpretAsLink(action.link);
		if (!link) {
			throw new Error('Invalid link');
		}

		let pane: ButtonPaneType | boolean | undefined = action.panetype;
		if (click.openInNewSplit()) {
			pane = ButtonPaneType.NewSplit;
		}
		if (click.openInNewTab()) {
			pane = ButtonPaneType.NewTab;
		}
		if (click.openInNewWindow()) {
			pane = ButtonPaneType.NewWindow;
		}

		link.open(this.mb, filePath, pane ?? (undefined as unknown as ButtonPaneType));
	}

	create(): Required<OpenButtonAction> {
		return { type: ButtonActionType.OPEN, link: '', panetype: ButtonPaneType.NewTab };
	}

	getActionLabel(): string {
		return 'Open a link';
	}
}
