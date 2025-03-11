import type { MetaBind } from 'packages/core/src';
import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	UpdateMetadataButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import { ErrorLevel, MetaBindJsError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { parseLiteral } from 'packages/core/src/utils/Literal';

export class UpdateMetadataButtonActionConfig extends AbstractButtonActionConfig<UpdateMetadataButtonAction> {
	constructor(mb: MetaBind) {
		super(ButtonActionType.UPDATE_METADATA, mb);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: UpdateMetadataButtonAction,
		filePath: string,
		_context: ButtonContext,
		_click: ButtonClickContext,
	): Promise<void> {
		const bindTarget = this.mb.bindTargetParser.fromStringAndValidate(action.bindTarget, filePath);

		if (action.evaluate) {
			if (!this.mb.getSettings().enableJs) {
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

			this.mb.api.updateMetadata(bindTarget, value =>
				func(value, bindTarget => {
					return this.mb.api.getMetadata(this.mb.api.parseBindTarget(bindTarget, filePath));
				}),
			);
		} else {
			this.mb.api.setMetadata(bindTarget, parseLiteral(action.value));
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
