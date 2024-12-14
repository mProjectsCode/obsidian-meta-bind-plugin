import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	UpdateMetadataButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';
import { ErrorLevel, MetaBindJsError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { parseLiteral } from 'packages/core/src/utils/Literal';

export class UpdateMetadataButtonActionConfig extends AbstractButtonActionConfig<UpdateMetadataButtonAction> {
	constructor(plugin: IPlugin) {
		super(ButtonActionType.UPDATE_METADATA, plugin);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: UpdateMetadataButtonAction,
		filePath: string,
		_context: ButtonContext,
		_click: ButtonClickContext,
	): Promise<void> {
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

	create(): Required<UpdateMetadataButtonAction> {
		return {
			type: ButtonActionType.UPDATE_METADATA,
			bindTarget: '',
			evaluate: false,
			value: '',
		};
	}

	getActionLabel(): string {
		return 'Update metadata';
	}
}
