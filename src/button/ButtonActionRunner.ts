import { type IPlugin } from '../IPlugin';
import {
	type ButtonAction,
	ButtonActionType,
	type CommandButtonAction,
	type JSButtonAction,
	type OpenButtonAction,
} from '../config/ButtonConfig';
import { MDLinkParser } from '../parsers/MarkdownLinkParser';
import { DocsHelper } from '../utils/DocsHelper';

export class ButtonActionRunner {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	async runAction(action: ButtonAction, filePath: string): Promise<void> {
		if (action.type === ButtonActionType.COMMAND) {
			await this.runCommandAction(action);
		} else if (action.type === ButtonActionType.JS) {
			await this.runJSAction(action, filePath);
		} else if (action.type === ButtonActionType.OPEN) {
			await this.runOpenAction(action, filePath);
		}
	}

	async runCommandAction(action: CommandButtonAction): Promise<void> {
		this.plugin.internal.executeCommandById(action.command);
	}

	async runJSAction(action: JSButtonAction, filePath: string): Promise<void> {
		const unloadCallback = await this.plugin.internal.jsEngineRunFile(action.jsFile, filePath);
		unloadCallback();
	}

	async runOpenAction(action: OpenButtonAction, filePath: string): Promise<void> {
		const link = MDLinkParser.parseLinkOrUrl(action.link);
		if (link.internal) {
			this.plugin.internal.openFile(link.target, filePath);
		} else {
			// TODO: replace this with a proper function
			DocsHelper.open(link.target);
		}
	}
}
