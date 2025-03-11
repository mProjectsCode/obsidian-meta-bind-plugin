import type { MetaBind } from 'packages/core/src';
import type { LinePosition } from 'packages/core/src/config/APIConfigs';
import type {
	ButtonActionMap,
	ButtonClickContext,
	ButtonClickType,
	ButtonConfig,
	ButtonContext,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType, ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
import type { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import { CommandButtonActionConfig } from 'packages/core/src/fields/button/actions/CommandButtonActionConfig';
import { CreateNoteButtonActionConfig } from 'packages/core/src/fields/button/actions/CreateNoteButtonActionConfig';
import { InlineJSButtonActionConfig } from 'packages/core/src/fields/button/actions/InlineJSButtonActionConfig';
import { InputButtonActionConfig } from 'packages/core/src/fields/button/actions/InputButtonActionConfig';
import { InsertIntoNoteButtonActionConfig } from 'packages/core/src/fields/button/actions/InsertIntoNoteButtonActionConfig';
import { JSButtonActionConfig } from 'packages/core/src/fields/button/actions/JSButtonActionConfig';
import { OpenButtonActionConfig } from 'packages/core/src/fields/button/actions/OpenButtonActionConfig';
import { RegexpReplaceInNoteButtonActionConfig } from 'packages/core/src/fields/button/actions/RegexpReplaceInNoteButtonActionConfig';
import { ReplaceInNoteButtonActionConfig } from 'packages/core/src/fields/button/actions/ReplaceInNoteButtonActionConfig';
import { ReplaceSelfButtonActionConfig } from 'packages/core/src/fields/button/actions/ReplaceSelfButtonActionConfig';
import { RunTemplaterFileButtonActionConfig } from 'packages/core/src/fields/button/actions/RunTemplaterFileButtonActionConfig';
import { SleepButtonActionConfig } from 'packages/core/src/fields/button/actions/SleepButtonActionConfig';
import { TemplaterCreateNoteButtonActionConfig } from 'packages/core/src/fields/button/actions/TemplaterCreateNoteButtonActionConfig';
import { UpdateMetadataButtonActionConfig } from 'packages/core/src/fields/button/actions/UpdateMetadataButtonActionConfig';
import { MDLinkParser } from 'packages/core/src/parsers/MarkdownLinkParser';
import { ErrorLevel, MetaBindParsingError } from 'packages/core/src/utils/errors/MetaBindErrors';
import type { LineNumberContext } from 'packages/core/src/utils/LineNumberExpression';

type ActionContexts = {
	[key in ButtonActionType]: AbstractButtonActionConfig<ButtonActionMap[key]>;
};

export class ButtonActionRunner {
	mb: MetaBind;
	actionContexts: ActionContexts;

	constructor(mb: MetaBind) {
		this.mb = mb;

		this.actionContexts = {
			[ButtonActionType.COMMAND]: new CommandButtonActionConfig(mb),
			[ButtonActionType.OPEN]: new OpenButtonActionConfig(mb),
			[ButtonActionType.JS]: new JSButtonActionConfig(mb),
			[ButtonActionType.INPUT]: new InputButtonActionConfig(mb),
			[ButtonActionType.SLEEP]: new SleepButtonActionConfig(mb),
			[ButtonActionType.TEMPLATER_CREATE_NOTE]: new TemplaterCreateNoteButtonActionConfig(mb),
			[ButtonActionType.UPDATE_METADATA]: new UpdateMetadataButtonActionConfig(mb),
			[ButtonActionType.CREATE_NOTE]: new CreateNoteButtonActionConfig(mb),
			[ButtonActionType.REPLACE_IN_NOTE]: new ReplaceInNoteButtonActionConfig(mb),
			[ButtonActionType.REPLACE_SELF]: new ReplaceSelfButtonActionConfig(mb),
			[ButtonActionType.REGEXP_REPLACE_IN_NOTE]: new RegexpReplaceInNoteButtonActionConfig(mb),
			[ButtonActionType.INSERT_INTO_NOTE]: new InsertIntoNoteButtonActionConfig(mb),
			[ButtonActionType.INLINE_JS]: new InlineJSButtonActionConfig(mb),
			[ButtonActionType.RUN_TEMPLATER_FILE]: new RunTemplaterFileButtonActionConfig(mb),
		};
	}

	/**
	 * Resolves a file name, path or link to a file path.
	 */
	resolveFilePath(filePath: string, relativeTo?: string): string {
		const targetFilePath = MDLinkParser.isLink(filePath) ? MDLinkParser.parseLink(filePath).target : filePath;
		const resolvedFilePath = this.mb.file.getPathByName(targetFilePath, relativeTo);
		if (resolvedFilePath === undefined) {
			throw new MetaBindParsingError({
				errorLevel: ErrorLevel.ERROR,
				cause: `Could not find a file that matches "${filePath}".`,
				effect: `Could not resolve path or link "${filePath}" relative to "${relativeTo}".`,
			});
		}

		return resolvedFilePath;
	}

	createDefaultButtonConfig(): ButtonConfig {
		return {
			label: 'This is a button',
			icon: '',
			style: ButtonStyleType.DEFAULT,
			class: '',
			cssStyle: '',
			backgroundImage: '',
			tooltip: '',
			id: '',
			hidden: false,
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
	async runButtonActions(
		config: ButtonConfig,
		filePath: string,
		context: ButtonContext,
		click: ButtonClickContext,
	): Promise<void> {
		try {
			if (config.action) {
				await this.runAction(config, config.action, filePath, context, click);
			} else if (config.actions) {
				for (const action of config.actions) {
					await this.runAction(config, action, filePath, context, click);
				}
			} else {
				console.warn('meta-bind | ButtonMDRC >> no action defined');
			}
		} catch (e) {
			console.warn('meta-bind | ButtonMDRC >> error while running action', e);
			this.mb.internal.showNotice(
				'meta-bind | Error while running button action. Check the console for details.',
			);
		}
	}

	/**
	 * Create a default action for the given type.
	 *
	 * @param type
	 */
	createDefaultAction<T extends ButtonActionType>(type: T): Required<ButtonActionMap[T]> {
		return this.actionContexts[type].create();
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
	async runAction<T extends ButtonActionType>(
		config: ButtonConfig | undefined,
		action: ButtonActionMap[T],
		filePath: string,
		buttonContext: ButtonContext,
		click: ButtonClickContext,
	): Promise<void> {
		const actionType: T = action.type as T;
		await this.actionContexts[actionType].run(config, action, filePath, buttonContext, click);
	}

	getActionLabel<T extends ButtonActionType>(type: T): string {
		return this.actionContexts[type].getActionLabel();
	}

	mouseEventToClickContext(event: MouseEvent, type: ButtonClickType): ButtonClickContext {
		return {
			type: type,
			shiftKey: event.shiftKey,
			ctrlKey: event.ctrlKey,
			altKey: event.altKey,
		};
	}

	getLineNumberContext(fileContent: string, selfNotePosition: LinePosition | undefined): LineNumberContext {
		const fileStart = 1;
		const fileEnd = fileContent.split('\n').length;
		const frontmatterPosition = this.mb.file.getFrontmatterLocation(fileContent);

		return {
			fileStart: fileStart,
			fileEnd: fileEnd,
			frontmatterStart: frontmatterPosition ? frontmatterPosition.lineStart : fileStart,
			frontmatterEnd: frontmatterPosition ? frontmatterPosition.lineEnd : fileStart,
			contentStart: frontmatterPosition ? frontmatterPosition.lineEnd + 1 : fileStart,
			contentEnd: fileEnd,
			selfStart: selfNotePosition ? selfNotePosition.lineStart + 1 : undefined,
			selfEnd: selfNotePosition ? selfNotePosition.lineEnd + 1 : undefined,
		};
	}
}
