import {
	type ButtonAction,
	ButtonActionType,
	type CommandButtonAction,
	type InputButtonAction,
	type JSButtonAction,
	type OpenButtonAction,
	type QuickSwitcherButtonAction,
	type SleepButtonAction,
	type TemplaterCreateNoteButtonAction,
} from '../../config/ButtonConfig';
import { MDLinkParser } from '../../parsers/MarkdownLinkParser';
import { DocsHelper } from '../../utils/DocsHelper';
import { type IPlugin } from '../../IPlugin';

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
		} else if (action.type === ButtonActionType.INPUT) {
			await this.runInputAction(action);
		} else if (action.type === ButtonActionType.SLEEP) {
			await this.runSleepAction(action);
		} else if (action.type === ButtonActionType.TEMPLATER_CREATE_NOTE) {
			await this.runTemplaterCreateNoteAction(action);
		} else if (action.type === ButtonActionType.QUICK_SWITCHER) {
			await this.runQuickSwitcherAction(action);
		}
	}

	async runCommandAction(action: CommandButtonAction): Promise<void> {
		this.plugin.internal.executeCommandById(action.command);
	}

	async runJSAction(action: JSButtonAction, filePath: string): Promise<void> {
		const unloadCallback = await this.plugin.internal.jsEngineRunFile(action.file, filePath);
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

	async runInputAction(action: InputButtonAction): Promise<void> {
		const el = document.activeElement;
		if (el && el instanceof HTMLInputElement) {
			el.setRangeText(action.str, el.selectionStart!, el.selectionEnd!, 'end');
			el.trigger('input');
		}
	}

	async runSleepAction(action: SleepButtonAction): Promise<void> {
		await new Promise(resolve => setTimeout(resolve, action.ms));
	}

	async runTemplaterCreateNoteAction(_action: TemplaterCreateNoteButtonAction): Promise<void> {
		throw new Error('Not supported');
	}

	async runQuickSwitcherAction(_action: QuickSwitcherButtonAction): Promise<void> {
		// TODO
	}
}
