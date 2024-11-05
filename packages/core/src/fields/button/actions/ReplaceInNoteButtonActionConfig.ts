import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	ReplaceInNoteButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';

export class ReplaceInNoteButtonActionConfig extends AbstractButtonActionConfig<ReplaceInNoteButtonAction> {
	constructor(plugin: IPlugin) {
		super(ButtonActionType.REPLACE_IN_NOTE, plugin);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: ReplaceInNoteButtonAction,
		filePath: string,
		_context: ButtonContext,
		_click: ButtonClickContext,
	): Promise<void> {
		if (action.fromLine > action.toLine) {
			throw new Error('From line cannot be greater than to line');
		}

		const replacement = action.templater
			? await this.plugin.internal.evaluateTemplaterTemplate(
					this.plugin.api.buttonActionRunner.resolveFilePath(action.replacement),
					filePath,
				)
			: action.replacement;

		await this.plugin.internal.file.atomicModify(filePath, content => {
			let splitContent = content.split('\n');

			if (action.fromLine < 0 || action.toLine > splitContent.length + 1) {
				throw new Error('Line numbers out of bounds');
			}

			splitContent = [
				...splitContent.slice(0, action.fromLine - 1),
				replacement,
				...splitContent.slice(action.toLine),
			];

			return splitContent.join('\n');
		});
	}

	create(): Required<ReplaceInNoteButtonAction> {
		return {
			type: ButtonActionType.REPLACE_IN_NOTE,
			fromLine: 0,
			toLine: 0,
			replacement: 'Replacement text',
			templater: false,
		};
	}

	getActionLabel(): string {
		return 'Replace text in note';
	}
}
