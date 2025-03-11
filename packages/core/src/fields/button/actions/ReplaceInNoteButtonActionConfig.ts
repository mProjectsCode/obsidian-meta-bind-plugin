import type { MetaBind } from 'packages/core/src';
import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	ReplaceInNoteButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import { P_lineNumberExpression } from 'packages/core/src/parsers/nomParsers/MiscNomParsers';
import { runParser } from 'packages/core/src/parsers/ParsingError';

export class ReplaceInNoteButtonActionConfig extends AbstractButtonActionConfig<ReplaceInNoteButtonAction> {
	constructor(mb: MetaBind) {
		super(ButtonActionType.REPLACE_IN_NOTE, mb);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: ReplaceInNoteButtonAction,
		filePath: string,
		context: ButtonContext,
		_click: ButtonClickContext,
	): Promise<void> {
		const replacement = action.templater
			? await this.mb.internal.evaluateTemplaterTemplate(
					this.mb.buttonActionRunner.resolveFilePath(action.replacement),
					filePath,
				)
			: action.replacement;

		const fromLine = runParser(P_lineNumberExpression, action.fromLine.toString());
		const toLine = runParser(P_lineNumberExpression, action.toLine.toString());

		await this.mb.file.atomicModify(filePath, content => {
			let splitContent = content.split('\n');

			const lineContext = this.mb.buttonActionRunner.getLineNumberContext(content, context.position);
			const fromLineNumber = fromLine.evaluate(lineContext);
			const toLineNumber = toLine.evaluate(lineContext);

			if (fromLineNumber > toLineNumber) {
				throw new Error(`From line (${fromLineNumber}) can't be greater than to line (${toLineNumber})`);
			}

			if (fromLineNumber < 1) {
				throw new Error(`From line (${fromLineNumber}) can't smaller than 1.`);
			}
			if (toLineNumber > splitContent.length) {
				throw new Error(`To line (${toLineNumber}) can't greater than the file length ${splitContent.length}.`);
			}

			splitContent = [
				...splitContent.slice(0, fromLineNumber - 1),
				replacement,
				...splitContent.slice(toLineNumber),
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
