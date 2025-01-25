import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	ReplaceSelfButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';

export class ReplaceSelfButtonActionConfig extends AbstractButtonActionConfig<ReplaceSelfButtonAction> {
	constructor(plugin: IPlugin) {
		super(ButtonActionType.REPLACE_SELF, plugin);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: ReplaceSelfButtonAction,
		filePath: string,
		context: ButtonContext,
		_click: ButtonClickContext,
	): Promise<void> {
		if (context.isInline) {
			throw new Error('Replace self action not supported for inline buttons');
		}

		if (context.position === undefined) {
			throw new Error('Position of the button in the note is unknown');
		}

		if (context.position.lineStart > context.position.lineEnd) {
			throw new Error('Position of the button in the note is invalid');
		}

		const position = context.position;

		const replacement = action.templater
			? await this.plugin.internal.evaluateTemplaterTemplate(
					this.plugin.api.buttonActionRunner.resolveFilePath(action.replacement),
					filePath,
				)
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

	create(): Required<ReplaceSelfButtonAction> {
		return {
			type: ButtonActionType.REPLACE_SELF,
			replacement: 'Replacement text',
			templater: false,
		};
	}

	getActionLabel(): string {
		return 'Replace button with text';
	}
}
