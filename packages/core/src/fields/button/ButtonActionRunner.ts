import { type IPlugin } from 'packages/core/src/IPlugin';
import {
	type ButtonAction,
	ButtonActionType,
	type ButtonConfig,
	ButtonStyleType,
	type CommandButtonAction,
	type InputButtonAction,
	type JSButtonAction,
	type OpenButtonAction,
	type SleepButtonAction,
	type TemplaterCreateNoteButtonAction,
	type UpdateMetadataButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { MDLinkParser } from 'packages/core/src/parsers/MarkdownLinkParser';
import { Signal } from 'packages/core/src/utils/Signal';
import { getUUID, openURL } from 'packages/core/src/utils/Utils';

export class ButtonActionRunner {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	createDefaultButtonConfig(): ButtonConfig {
		return {
			label: 'This is a button',
			hidden: false,
			class: '',
			tooltip: '',
			id: '',
			style: ButtonStyleType.DEFAULT,
			actions: [],
		};
	}

	/**
	 * Run the action(s) defined in the button config.
	 * Will show a notice if an error occurs.
	 *
	 * @param config
	 * @param filePath
	 */
	async runButtonAction(config: ButtonConfig, filePath: string): Promise<void> {
		try {
			if (config.action) {
				await this.plugin.api.buttonActionRunner.runAction(config, config.action, filePath);
			} else if (config.actions) {
				for (const action of config.actions) {
					await this.plugin.api.buttonActionRunner.runAction(config, action, filePath);
				}
			} else {
				console.warn('meta-bind | ButtonMDRC >> no action defined');
			}
		} catch (e) {
			console.warn('meta-bind | ButtonMDRC >> error while running action', e);
			this.plugin.internal.showNotice(
				'meta-bind | Error while running button action. Check the console for details.',
			);
		}
	}

	/**
	 * Create a default action for the given type.
	 *
	 * @param type
	 */
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
		} else if (type === ButtonActionType.UPDATE_METADATA) {
			return {
				type: ButtonActionType.UPDATE_METADATA,
				bindTarget: '',
				evaluate: false,
				value: '',
			} satisfies UpdateMetadataButtonAction;
		}

		throw new Error(`Unknown button action type: ${type}`);
	}

	/**
	 * Run a specific button action.
	 * Will throw.
	 *
	 * @param config
	 * @param action
	 * @param filePath
	 */
	async runAction(config: ButtonConfig, action: ButtonAction, filePath: string): Promise<void> {
		if (action.type === ButtonActionType.COMMAND) {
			await this.runCommandAction(action);
			return;
		} else if (action.type === ButtonActionType.JS) {
			await this.runJSAction(config, action, filePath);
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
		} else if (action.type === ButtonActionType.UPDATE_METADATA) {
			await this.runUpdateMetadataAction(action, filePath);
			return;
		}

		throw new Error(`Unknown button action type`);
	}

	async runCommandAction(action: CommandButtonAction): Promise<void> {
		this.plugin.internal.executeCommandById(action.command);
	}

	async runJSAction(config: ButtonConfig, action: JSButtonAction, filePath: string): Promise<void> {
		const configOverrides: Record<string, unknown> = {
			buttonConfig: config,
			args: action.args,
		};
		const unloadCallback = await this.plugin.internal.jsEngineRunFile(action.file, filePath, configOverrides);
		unloadCallback();
	}

	async runOpenAction(action: OpenButtonAction, filePath: string): Promise<void> {
		const link = MDLinkParser.parseLinkOrUrl(action.link);
		if (link.internal) {
			this.plugin.internal.openFile(link.target, filePath, action.newTab ?? false);
		} else {
			openURL(link.target);
		}
	}

	async runInputAction(action: InputButtonAction): Promise<void> {
		const el = document.activeElement;
		if (el && el instanceof HTMLInputElement) {
			el.setRangeText(action.str, el.selectionStart!, el.selectionEnd!, 'end');
			el.dispatchEvent(new Event('input', { bubbles: true }));
		}
	}

	async runSleepAction(action: SleepButtonAction): Promise<void> {
		await new Promise(resolve => setTimeout(resolve, action.ms));
	}

	async runTemplaterCreateNoteAction(_action: TemplaterCreateNoteButtonAction): Promise<void> {
		throw new Error('Not supported');
	}

	async runUpdateMetadataAction(action: UpdateMetadataButtonAction, filePath: string): Promise<void> {
		const bindTarget = this.plugin.api.bindTargetParser.fromStringAndValidate(action.bindTarget, filePath);
		const uuid = getUUID();
		const signal = new Signal<unknown>(undefined);
		const subscription = this.plugin.metadataManager.subscribe(uuid, signal, bindTarget, () => {});
		subscription.applyUpdate({
			value: action.value,
			evaluate: action.evaluate,
		});
		subscription.unsubscribe();
	}
}
