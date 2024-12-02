import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	InlineJSButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';
import { ErrorLevel, MetaBindJsError } from 'packages/core/src/utils/errors/MetaBindErrors';

export class InlineJSButtonActionConfig extends AbstractButtonActionConfig<InlineJSButtonAction> {
	constructor(plugin: IPlugin) {
		super(ButtonActionType.INLINE_JS, plugin);
	}

	async run(
		config: ButtonConfig | undefined,
		action: InlineJSButtonAction,
		filePath: string,
		context: ButtonContext,
		click: ButtonClickContext,
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
			buttonContext: structuredClone(context),
			click: structuredClone(click),
		};
		const unloadCallback = await this.plugin.internal.jsEngineRunCode(action.code, filePath, configOverrides);
		unloadCallback();
	}

	create(): Required<InlineJSButtonAction> {
		return {
			type: ButtonActionType.INLINE_JS,
			code: 'console.log("Hello world")',
			args: {},
		};
	}

	getActionLabel(): string {
		return 'Run JavaScript code';
	}
}
