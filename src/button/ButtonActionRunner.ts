import { type IPlugin } from '../IPlugin';
import {
	type ButtonAction,
	ButtonActionType,
	type CommandButtonAction,
	type JSButtonAction,
} from '../config/ButtonConfig';

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
		}
	}

	async runCommandAction(action: CommandButtonAction): Promise<void> {
		this.plugin.internal.executeCommandById(action.command);
	}

	async runJSAction(action: JSButtonAction, filePath: string): Promise<void> {
		const unloadCallback = await this.plugin.internal.jsEngineRunFile(action.jsFile, filePath);
		unloadCallback();
	}
}
