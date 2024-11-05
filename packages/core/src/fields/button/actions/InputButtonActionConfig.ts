import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	InputButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';

export class InputButtonActionConfig extends AbstractButtonActionConfig<InputButtonAction> {
	constructor(plugin: IPlugin) {
		super(ButtonActionType.INPUT, plugin);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: InputButtonAction,
		_filePath: string,
		_context: ButtonContext,
		_click: ButtonClickContext,
	): Promise<void> {
		const el = document.activeElement;
		if (el && el instanceof HTMLInputElement) {
			el.setRangeText(action.str, el.selectionStart!, el.selectionEnd!, 'end');
			el.dispatchEvent(new Event('input', { bubbles: true }));
		}
	}

	create(): Required<InputButtonAction> {
		return { type: ButtonActionType.INPUT, str: '' };
	}

	getActionLabel(): string {
		return 'Insert text at cursor';
	}
}
