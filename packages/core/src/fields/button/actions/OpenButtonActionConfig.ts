import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	OpenButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';
import { MDLinkParser } from 'packages/core/src/parsers/MarkdownLinkParser';

export class OpenButtonActionConfig extends AbstractButtonActionConfig<OpenButtonAction> {
	constructor(plugin: IPlugin) {
		super(ButtonActionType.OPEN, plugin);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: OpenButtonAction,
		filePath: string,
		_context: ButtonContext,
		_click: ButtonClickContext,
	): Promise<void> {
		MDLinkParser.parseLinkOrUrl(action.link).open(this.plugin, filePath, action.newTab ?? false);
	}

	create(): Required<OpenButtonAction> {
		return { type: ButtonActionType.OPEN, link: '', newTab: true };
	}

	getActionLabel(): string {
		return 'Open a link';
	}
}
