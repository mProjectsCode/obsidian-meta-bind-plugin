import type {
	ButtonAction,
	ButtonConfig,
	ButtonContext,
	CommandButtonAction,
	CreateNoteButtonAction,
	InlineJsButtonAction,
	InputButtonAction,
	InsertIntoNoteButtonAction,
	JSButtonAction,
	OpenButtonAction,
	RegexpReplaceInNoteButtonAction,
	ReplaceInNoteButtonAction,
	ReplaceSelfButtonAction,
	SleepButtonAction,
	TemplaterCreateNoteButtonAction,
	UpdateMetadataButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType, ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';
import { MDLinkParser } from 'packages/core/src/parsers/MarkdownLinkParser';
import { ErrorLevel, MetaBindJsError, MetaBindParsingError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { parseLiteral } from 'packages/core/src/utils/Literal';
import { ensureFileExtension, expectType, joinPath } from 'packages/core/src/utils/Utils';

export class ButtonActionRunner {
	plugin: IPlugin;

	constructor(plugin: IPlugin) {
		this.plugin = plugin;
	}

	resolveFilePath(filePath: string, relativeFilePath?: string | undefined): string {
		const targetFilePath = MDLinkParser.isLink(filePath) ? MDLinkParser.parseLink(filePath).target : filePath;
		const resolvedFilePath = this.plugin.internal.file.getPathByName(targetFilePath, relativeFilePath);
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
	async runButtonActions(config: ButtonConfig, filePath: string, context: ButtonContext): Promise<void> {
		try {
			if (config.action) {
				await this.plugin.api.buttonActionRunner.runAction(config, config.action, filePath, context);
			} else if (config.actions) {
				for (const action of config.actions) {
					await this.plugin.api.buttonActionRunner.runAction(config, action, filePath, context);
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
				openIfAlreadyExists: false,
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
				openIfAlreadyExists: false,
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
		buttonContext: ButtonContext,
	): Promise<void> {
		if (action.type === ButtonActionType.COMMAND) {
			await this.runCommandAction(action);
			return;
		} else if (action.type === ButtonActionType.JS) {
			await this.runJSAction(config, action, filePath, buttonContext);
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
			await this.runReplaceSelfAction(action, filePath, buttonContext);
			return;
		} else if (action.type === ButtonActionType.REGEXP_REPLACE_IN_NOTE) {
			await this.runRegexpReplaceInNoteAction(action, filePath);
			return;
		} else if (action.type === ButtonActionType.INSERT_INTO_NOTE) {
			await this.runInsertIntoNoteAction(action, filePath);
			return;
		} else if (action.type === ButtonActionType.INLINE_JS) {
			await this.runInlineJsAction(config, action, filePath, buttonContext);
			return;
		}

		expectType<never>(action);

		throw new Error(`Unknown button action type`);
	}

	async runCommandAction(action: CommandButtonAction): Promise<void> {
		this.plugin.internal.executeCommandById(action.command);
	}

	async runJSAction(
		config: ButtonConfig | undefined,
		action: JSButtonAction,
		filePath: string,
		buttonContext: ButtonContext,
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
			args: structuredClone(action.args),
			buttonContext: structuredClone(buttonContext),
		};
		const unloadCallback = await this.plugin.internal.jsEngineRunFile(action.file, filePath, configOverrides);
		unloadCallback();
	}

	async runOpenAction(action: OpenButtonAction, filePath: string): Promise<void> {
		MDLinkParser.parseLinkOrUrl(action.link).open(this.plugin, filePath, action.newTab ?? false);
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
		if (action.openIfAlreadyExists && action.fileName) {
			const filePath = ensureFileExtension(joinPath(action.folderPath ?? '', action.fileName), 'md');
			// if the file already exists, open it in the same tab
			if (await this.plugin.internal.file.exists(filePath)) {
				this.plugin.internal.file.open(filePath, '', false);
				return;
			}
		}

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
			const func = new Function('x', 'getMetadata', `return ${action.value};`) as (
				value: unknown,
				getMetadata: (bindTarget: string) => unknown,
			) => unknown;

			this.plugin.api.updateMetadata(bindTarget, value =>
				func(value, bindTarget => {
					return this.plugin.api.getMetadata(this.plugin.api.parseBindTarget(bindTarget, filePath));
				}),
			);
		} else {
			this.plugin.api.setMetadata(bindTarget, parseLiteral(action.value));
		}
	}

	async runCreateNoteAction(action: CreateNoteButtonAction): Promise<void> {
		if (action.openIfAlreadyExists) {
			const filePath = ensureFileExtension(joinPath(action.folderPath ?? '', action.fileName), 'md');
			// if the file already exists, open it in the same tab
			if (await this.plugin.internal.file.exists(filePath)) {
				this.plugin.internal.file.open(filePath, '', false);
				return;
			}
		}

		await this.plugin.internal.file.create(
			action.folderPath ?? '',
			action.fileName,
			'md',
			action.openNote ?? false,
		);
	}

	async runReplaceInNoteAction(action: ReplaceInNoteButtonAction, filePath: string): Promise<void> {
		if (action.fromLine > action.toLine) {
			throw new Error('From line cannot be greater than to line');
		}

		const replacement = action.templater
			? await this.plugin.internal.evaluateTemplaterTemplate(this.resolveFilePath(action.replacement), filePath)
			: action.replacement;

		await this.plugin.internal.file.atomicModify(filePath, content => {
			let splitContent = content.split('\n');

			if (action.fromLine < 0 || action.toLine > splitContent.length + 1) {
				throw new Error('Line numbers out of bounds');
			}

			splitContent = [
				...splitContent.slice(0, action.fromLine - 1),
				replacement,
				...splitContent.slice(action.toLine),
			];

			return splitContent.join('\n');
		});
	}

	async runReplaceSelfAction(
		action: ReplaceSelfButtonAction,
		filePath: string,
		buttonContext: ButtonContext,
	): Promise<void> {
		if (buttonContext.isInline) {
			throw new Error('Replace self action not supported for inline buttons');
		}

		if (buttonContext.position === undefined) {
			throw new Error('Position of the button in the note is unknown');
		}

		if (buttonContext.position.lineStart > buttonContext.position.lineEnd) {
			throw new Error('Position of the button in the note is invalid');
		}

		const position = buttonContext.position;

		const replacement = action.templater
			? await this.plugin.internal.evaluateTemplaterTemplate(this.resolveFilePath(action.replacement), filePath)
			: action.replacement;

		await this.plugin.internal.file.atomicModify(filePath, content => {
			let splitContent = content.split('\n');

			if (position.lineStart < 0 || position.lineEnd > splitContent.length + 1) {
				throw new Error('Position of the button in the note is out of bounds');
			}

			splitContent = [
				...splitContent.slice(0, position.lineStart),
				replacement,
				...splitContent.slice(position.lineEnd + 1),
			];

			return splitContent.join('\n');
		});
	}

	async runRegexpReplaceInNoteAction(action: RegexpReplaceInNoteButtonAction, filePath: string): Promise<void> {
		if (action.regexp === '') {
			throw new Error('Regexp cannot be empty');
		}

		await this.plugin.internal.file.atomicModify(filePath, content => {
			return content.replace(new RegExp(action.regexp, action.regexpFlags ?? 'g'), action.replacement);
		});
	}

	async runInsertIntoNoteAction(action: InsertIntoNoteButtonAction, filePath: string): Promise<void> {
		const insertString = action.templater
			? await this.plugin.internal.evaluateTemplaterTemplate(this.resolveFilePath(action.value), filePath)
			: action.value;

		await this.plugin.internal.file.atomicModify(filePath, content => {
			let splitContent = content.split('\n');

			if (action.line < 1 || action.line > splitContent.length + 1) {
				throw new Error('Line number out of bounds');
			}

			splitContent = [
				...splitContent.slice(0, action.line - 1),
				insertString,
				...splitContent.slice(action.line - 1),
			];

			return splitContent.join('\n');
		});
	}

	async runInlineJsAction(
		config: ButtonConfig | undefined,
		action: InlineJsButtonAction,
		filePath: string,
		buttonContext: ButtonContext,
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
			buttonContext: structuredClone(buttonContext),
		};
		const unloadCallback = await this.plugin.internal.jsEngineRunCode(action.code, filePath, configOverrides);
		unloadCallback();
	}
}
