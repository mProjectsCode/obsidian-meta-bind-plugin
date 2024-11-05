import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	SleepButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';

export class SleepButtonActionConfig extends AbstractButtonActionConfig<SleepButtonAction> {
	constructor(plugin: IPlugin) {
		super(ButtonActionType.SLEEP, plugin);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: SleepButtonAction,
		_filePath: string,
		_context: ButtonContext,
		_click: ButtonClickContext,
	): Promise<void> {
		await new Promise(resolve => setTimeout(resolve, action.ms));
	}

	create(): Required<SleepButtonAction> {
		return { type: ButtonActionType.SLEEP, ms: 0 };
	}

	getActionLabel(): string {
		return 'Sleep for some time';
	}
}
