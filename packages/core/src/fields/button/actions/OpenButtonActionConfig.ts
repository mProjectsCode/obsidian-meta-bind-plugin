import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	OpenButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType, ButtonClickType } from 'packages/core/src/config/ButtonConfig';
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
		click: ButtonClickContext,
	): Promise<void> {
		const newTab = click.type === ButtonClickType.MIDDLE || click.ctrlKey || (action.newTab ?? false);
		const link = MDLinkParser.interpretAsLink(action.link);
		if (!link) {
			throw new Error('Invalid link');
		}
		link.open(this.plugin, filePath, newTab);
	}

	create(): Required<OpenButtonAction> {
		return { type: ButtonActionType.OPEN, link: '', newTab: true };
	}

	getActionLabel(): string {
		return 'Open a link';
	}
}
