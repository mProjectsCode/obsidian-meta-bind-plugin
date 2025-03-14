import type { MetaBind } from 'packages/core/src';
import type {
	ButtonActionMap,
	ButtonClickContext,
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
}
