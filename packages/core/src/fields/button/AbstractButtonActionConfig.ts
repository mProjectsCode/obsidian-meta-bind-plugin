import type {
	ButtonActionType,
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
} from 'packages/core/src/config/ButtonConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';

export abstract class AbstractButtonActionConfig<T> {
	actionType: ButtonActionType;
	plugin: IPlugin;

	constructor(actionType: ButtonActionType, plugin: IPlugin) {
		this.actionType = actionType;
		this.plugin = plugin;
	}

	abstract run(
		config: ButtonConfig | undefined,
		action: T,
		filePath: string,
		context: ButtonContext,
		click: ButtonClickContext,
	): Promise<void>;

	abstract create(): Required<T>;

	abstract getActionLabel(): string;
}
