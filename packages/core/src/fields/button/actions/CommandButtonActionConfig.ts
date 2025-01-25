import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	CommandButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';

export class CommandButtonActionConfig extends AbstractButtonActionConfig<CommandButtonAction> {
	constructor(plugin: IPlugin) {
		super(ButtonActionType.COMMAND, plugin);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: CommandButtonAction,
		_filePath: string,
		_context: ButtonContext,
		_click: ButtonClickContext,
	): Promise<void> {
		this.plugin.internal.executeCommandById(action.command);
	}

	create(): Required<CommandButtonAction> {
		return { type: ButtonActionType.COMMAND, command: '' };
	}

	getActionLabel(): string {
		return 'Run a command';
	}
}
