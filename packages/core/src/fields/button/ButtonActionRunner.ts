import { type IPlugin } from 'packages/core/src/IPlugin';
import {
	type ButtonAction,
	ButtonActionType,
	type ButtonConfig,
	ButtonStyleType,
	type CommandButtonAction,
	type CreateNoteButtonAction,
	type InlineJsButtonAction,
	type InputButtonAction,
	type InsertIntoNoteButtonAction,
	type JSButtonAction,
	type OpenButtonAction,
	type RegexpReplaceInNoteButtonAction,
	type ReplaceInNoteButtonAction,
	type ReplaceSelfButtonAction,
	type SleepButtonAction,
	type TemplaterCreateNoteButtonAction,
	type UpdateMetadataButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { MDLinkParser } from 'packages/core/src/parsers/MarkdownLinkParser';
import { expectType, openURL } from 'packages/core/src/utils/Utils';
import { parseLiteral } from 'packages/core/src/utils/Literal';

import { type NotePosition } from 'packages/core/src/config/APIConfigs';
import { ErrorLevel, MetaBindJsError, MetaBindParsingError } from 'packages/core/src/utils/errors/MetaBindErrors';

export class ButtonActionRunner {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	resolveFilePath(filePath: string, relativeFilePath?: string | undefined): string {
		const targetFilePath = MDLinkParser.isLink(filePath) ? MDLinkParser.parseLink(filePath).target : filePath;
		const resolvedFilePath = this.plugin.internal.getFilePathByName(targetFilePath, relativeFilePath);
		if (resolvedFilePath === undefined) {
			throw new MetaBindParsingError({
				errorLevel: ErrorLevel.ERROR,
				cause: 'Could not find a file that matches "${filePath}".',
				effect: `Could not resolve path or link "${filePath}" relative to "${relativeFilePath}".`,
			});
		}

		return resolvedFilePath;
	}

	createDefaultButtonConfig(): ButtonConfig {
		return {
			label: 'This is a button',
			icon: '',
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
	 * @param inline whether the button is inline
	 * @param position the position of the button in the note
	 */
	async runButtonAction(
		config: ButtonConfig,
		filePath: string,
		inline: boolean,
		position: NotePosition | undefined,
	): Promise<void> {
		try {
			if (config.action) {
				await this.plugin.api.buttonActionRunner.runAction(config, config.action, filePath, inline, position);
			} else if (config.actions) {
				for (const action of config.actions) {
					await this.plugin.api.buttonActionRunner.runAction(config, action, filePath, inline, position);
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
			return { type: ButtonActionType.JS, file: '', args: {} } satisfies JSButtonAction;
		} else if (type === ButtonActionType.INPUT) {
			return { type: ButtonActionType.INPUT, str: '' } satisfies InputButtonAction;
		} else if (type === ButtonActionType.SLEEP) {
			return { type: ButtonActionType.SLEEP, ms: 0 } satisfies SleepButtonAction;
		} else if (type === ButtonActionType.TEMPLATER_CREATE_NOTE) {
			return {
				type: ButtonActionType.TEMPLATER_CREATE_NOTE,
				templateFile: '',
				folderPath: '/',
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
		} else if (type === ButtonActionType.CREATE_NOTE) {
			return {
				type: ButtonActionType.CREATE_NOTE,
				folderPath: '/',
				fileName: 'Untitled',
				openNote: true,
			} satisfies CreateNoteButtonAction;
		} else if (type === ButtonActionType.REPLACE_IN_NOTE) {
			return {
				type: ButtonActionType.REPLACE_IN_NOTE,
				fromLine: 0,
				toLine: 0,
				replacement: 'Replacement text',
			} satisfies ReplaceInNoteButtonAction;
		} else if (type === ButtonActionType.REPLACE_SELF) {
			return {
				type: ButtonActionType.REPLACE_SELF,
				replacement: 'Replacement text',
			} satisfies ReplaceSelfButtonAction;
		} else if (type === ButtonActionType.REGEXP_REPLACE_IN_NOTE) {
			return {
				type: ButtonActionType.REGEXP_REPLACE_IN_NOTE,
				regexp: '([A-Z])\\w+',
				replacement: 'Replacement text',
			} satisfies RegexpReplaceInNoteButtonAction;
		} else if (type === ButtonActionType.INSERT_INTO_NOTE) {
			return {
				type: ButtonActionType.INSERT_INTO_NOTE,
				relative: false,
				line: 0,
				value: 'Some text',
			} satisfies InsertIntoNoteButtonAction;
		} else if (type === ButtonActionType.INLINE_JS) {
			return {
				type: ButtonActionType.INLINE_JS,
				code: 'console.log("Hello world")',
			} satisfies InlineJsButtonAction;
		}

		expectType<never>(type);

		throw new Error(`Unknown button action type: ${type}`);
	}

	/**
	 * Run a specific button action.
	 * Will throw.
	 *
	 * @param config
	 * @param action
	 * @param filePath
	 * @param inline whether the button is inline
	 * @param position the position of the button in the note
	 */
	async runAction(
		config: ButtonConfig | undefined,
		action: ButtonAction,
		filePath: string,
		inline: boolean,
		position: NotePosition | undefined,
	): Promise<void> {
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
		} else if (action.type === ButtonActionType.CREATE_NOTE) {
			await this.runCreateNoteAction(action);
			return;
		} else if (action.type === ButtonActionType.REPLACE_IN_NOTE) {
			await this.runReplaceInNoteAction(action, filePath);
			return;
		} else if (action.type === ButtonActionType.REPLACE_SELF) {
			await this.runReplaceSelfAction(action, filePath, inline, position);
			return;
		} else if (action.type === ButtonActionType.REGEXP_REPLACE_IN_NOTE) {
			await this.runRegexpReplaceInNotAction(action, filePath);
			return;
		} else if (action.type === ButtonActionType.INSERT_INTO_NOTE) {
			await this.runInsertIntoNoteAction(action, filePath, position);
			return;
		} else if (action.type === ButtonActionType.INLINE_JS) {
			await this.runInlineJsAction(config, action, filePath);
			return;
		}

		expectType<never>(action);

		throw new Error(`Unknown button action type`);
	}

	async runCommandAction(action: CommandButtonAction): Promise<void> {
		this.plugin.internal.executeCommandById(action.command);
	}

	async runJSAction(config: ButtonConfig | undefined, action: JSButtonAction, filePath: string): Promise<void> {
		if (!this.plugin.settings.enableJs) {
			throw new MetaBindJsError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: "Can't run button action that requires JS evaluation.",
				cause: 'JS evaluation is disabled in the plugin settings.',
			});
		}

		const configOverrides: Record<string, unknown> = {
			buttonConfig: structuredClone(config),
			args: structuredClone(action.args),
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

	async runTemplaterCreateNoteAction(action: TemplaterCreateNoteButtonAction): Promise<void> {
		await this.plugin.internal.createNoteWithTemplater(
			action.templateFile,
			action.folderPath,
			action.fileName,
			action.openNote,
		);
	}

	async runUpdateMetadataAction(action: UpdateMetadataButtonAction, filePath: string): Promise<void> {
		const bindTarget = this.plugin.api.bindTargetParser.fromStringAndValidate(action.bindTarget, filePath);

		if (action.evaluate) {
			if (!this.plugin.settings.enableJs) {
				throw new MetaBindJsError({
					errorLevel: ErrorLevel.CRITICAL,
					effect: "Can't run button action that requires JS evaluation.",
					cause: 'JS evaluation is disabled in the plugin settings.',
				});
			}

			// eslint-disable-next-line @typescript-eslint/no-implied-eval
			const func = new Function('x', `return ${action.value};`) as (value: unknown) => unknown;

			this.plugin.api.updateMetadata(bindTarget, func);
		} else {
			this.plugin.api.setMetadata(bindTarget, parseLiteral(action.value));
		}
	}

	async runCreateNoteAction(action: CreateNoteButtonAction): Promise<void> {
		await this.plugin.internal.createFile(action.folderPath ?? '', action.fileName, 'md', action.openNote ?? false);
	}

	async runReplaceInNoteAction(action: ReplaceInNoteButtonAction, filePath: string): Promise<void> {
		if (action.fromLine > action.toLine) {
			throw new Error('From line cannot be greater than to line');
		}

		const content = await this.plugin.internal.readFilePath(filePath);

		let splitContent = content.split('\n');

		if (action.fromLine < 0 || action.toLine > splitContent.length + 1) {
			throw new Error('Line numbers out of bounds');
		}

		const replacement = action.templater
			? await this.plugin.internal.evaluateTemplaterTemplate(this.resolveFilePath(action.replacement), filePath)
			: action.replacement;

		splitContent = [
			...splitContent.slice(0, action.fromLine - 1),
			replacement,
			...splitContent.slice(action.toLine),
		];

		await this.plugin.internal.writeFilePath(filePath, splitContent.join('\n'));
	}

	async runReplaceSelfAction(
		action: ReplaceSelfButtonAction,
		filePath: string,
		inline: boolean,
		position: NotePosition | undefined,
	): Promise<void> {
		if (inline) {
			throw new Error('Replace self action not supported for inline buttons');
		}

		const linePosition = position?.getPosition();

		if (linePosition === undefined) {
			throw new Error('Position of the button in the note is unknown');
		}

		if (linePosition.lineStart > linePosition.lineEnd) {
			throw new Error('Position of the button in the note is invalid');
		}

		const content = await this.plugin.internal.readFilePath(filePath);

		let splitContent = content.split('\n');

		if (linePosition.lineStart < 0 || linePosition.lineEnd > splitContent.length + 1) {
			throw new Error('Position of the button in the note is out of bounds');
		}

		const replacement = action.templater
			? await this.plugin.internal.evaluateTemplaterTemplate(this.resolveFilePath(action.replacement), filePath)
			: action.replacement;

		splitContent = [
			...splitContent.slice(0, linePosition.lineStart),
			replacement,
			...splitContent.slice(linePosition.lineEnd + 1),
		];

		await this.plugin.internal.writeFilePath(filePath, splitContent.join('\n'));
	}

	async runRegexpReplaceInNotAction(action: RegexpReplaceInNoteButtonAction, filePath: string): Promise<void> {
		if (action.regexp === '') {
			throw new Error('Regexp cannot be empty');
		}

		let content = await this.plugin.internal.readFilePath(filePath);

		content = content.replace(new RegExp(action.regexp, 'g'), action.replacement);

		await this.plugin.internal.writeFilePath(filePath, content);
	}

	async runInsertIntoNoteAction(
		action: InsertIntoNoteButtonAction,
		filePath: string,
		position: NotePosition | undefined,
	): Promise<void> {
		const content = await this.plugin.internal.readFilePath(filePath);

		let splitContent = content.split('\n');
		const linePosition = position?.getPosition();

		if ((action.line < 1 && !action.relative) || action.line > splitContent.length + 1) {
			throw new Error('Line number out of bounds');
		}

		if (linePosition === undefined) {
			throw new Error('Position of the button in the note is unknown');
		}

		const insertString = action.templater
			? await this.plugin.internal.evaluateTemplaterTemplate(this.resolveFilePath(action.value), filePath)
			: action.value;

		if (action.relative && action.line > 0) {
			splitContent = [
				...splitContent.slice(0, linePosition.lineEnd + action.line),
				insertString,
				...splitContent.slice(linePosition.lineEnd + action.line),
			];
		} else if (action.relative && action.line < 0) {
			splitContent = [
				...splitContent.slice(0, linePosition.lineStart - action.line - 1),
				insertString,
				...splitContent.slice(linePosition.lineStart + action.line + 1),
			];
		} else {
			splitContent = [
				...splitContent.slice(0, action.line - 1),
				insertString,
				...splitContent.slice(action.line - 1),
			];
		}

		await this.plugin.internal.writeFilePath(filePath, splitContent.join('\n'));
	}

	async runInlineJsAction(
		config: ButtonConfig | undefined,
		action: InlineJsButtonAction,
		filePath: string,
	): Promise<void> {
		if (!this.plugin.settings.enableJs) {
			throw new MetaBindJsError({
				errorLevel: ErrorLevel.CRITICAL,
				effect: "Can't run button action that requires JS evaluation.",
				cause: 'JS evaluation is disabled in the plugin settings.',
			});
		}

		const configOverrides: Record<string, unknown> = {
			buttonConfig: structuredClone(config),
		};
		const unloadCallback = await this.plugin.internal.jsEngineRunCode(action.code, filePath, configOverrides);
		unloadCallback();
	}
}
