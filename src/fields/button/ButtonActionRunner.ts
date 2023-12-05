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
import { DocsUtils } from '../../utils/DocsUtils';
import { type IPlugin } from '../../IPlugin';

export class ButtonActionRunner {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	createDefaultAction(type: ButtonActionType): ButtonAction {
		if (type === ButtonActionType.COMMAND) {
			return { type: ButtonActionType.COMMAND, command: '' } satisfies CommandButtonAction;
		} else if (type === ButtonActionType.OPEN) {
			return { type: ButtonActionType.OPEN, link: '' } satisfies OpenButtonAction;
		} else if (type === ButtonActionType.JS) {
			return { type: ButtonActionType.JS, file: '' } satisfies JSButtonAction;
		} else if (type === ButtonActionType.INPUT) {
			return { type: ButtonActionType.INPUT, str: '' } satisfies InputButtonAction;
		} else if (type === ButtonActionType.SLEEP) {
			return { type: ButtonActionType.SLEEP, ms: 0 } satisfies SleepButtonAction;
		} else if (type === ButtonActionType.TEMPLATER_CREATE_NOTE) {
			return {
				type: ButtonActionType.TEMPLATER_CREATE_NOTE,
				templateFile: '',
				folderPath: '',
				fileName: '',
				openNote: true,
			} satisfies TemplaterCreateNoteButtonAction;
		} else if (type === ButtonActionType.QUICK_SWITCHER) {
			return {
				type: ButtonActionType.QUICK_SWITCHER,
				filter: '',
			} satisfies QuickSwitcherButtonAction;
		}

		throw new Error(`Unknown button action type: ${type}`);
	}

	async runAction(action: ButtonAction, filePath: string): Promise<void> {
		if (action.type === ButtonActionType.COMMAND) {
			await this.runCommandAction(action);
			return;
		} else if (action.type === ButtonActionType.JS) {
			await this.runJSAction(action, filePath);
			return;
		} else if (action.type === ButtonActionType.OPEN) {
			await this.runOpenAction(action, filePath);
			return;
		} else if (action.type === ButtonActionType.INPUT) {
			await this.runInputAction(action);
			return;
		} else if (action.type === ButtonActionType.SLEEP) {
			await this.runSleepAction(action);
			return;
		} else if (action.type === ButtonActionType.TEMPLATER_CREATE_NOTE) {
			await this.runTemplaterCreateNoteAction(action);
			return;
		} else if (action.type === ButtonActionType.QUICK_SWITCHER) {
			await this.runQuickSwitcherAction(action);
			return;
		}

		throw new Error(`Unknown button action type`);
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
			DocsUtils.open(link.target);
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
		throw new Error('Not supported');
	}
}
