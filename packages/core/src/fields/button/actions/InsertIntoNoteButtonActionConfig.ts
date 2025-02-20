import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	InsertIntoNoteButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';
import { P_lineNumberExpression } from 'packages/core/src/parsers/nomParsers/MiscNomParsers';
import { runParser } from 'packages/core/src/parsers/ParsingError';

export class InsertIntoNoteButtonActionConfig extends AbstractButtonActionConfig<InsertIntoNoteButtonAction> {
	constructor(plugin: IPlugin) {
		super(ButtonActionType.INSERT_INTO_NOTE, plugin);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: InsertIntoNoteButtonAction,
		filePath: string,
		context: ButtonContext,
		_click: ButtonClickContext,
	): Promise<void> {
		const insertString = action.templater
			? await this.plugin.internal.evaluateTemplaterTemplate(
					this.plugin.api.buttonActionRunner.resolveFilePath(action.value),
					filePath,
				)
			: action.value;

		const line = runParser(P_lineNumberExpression, action.line.toString());

		await this.plugin.internal.file.atomicModify(filePath, content => {
			let splitContent = content.split('\n');

			const lineContext = this.plugin.api.buttonActionRunner.getLineNumberContext(content, context.position);
			const lineNumber = line.evaluate(lineContext);

			if (lineNumber < 1 || lineNumber > splitContent.length) {
				throw new Error('Line number out of bounds');
			}

			splitContent = [
				...splitContent.slice(0, lineNumber - 1),
				insertString,
				...splitContent.slice(lineNumber - 1),
			];

			return splitContent.join('\n');
		});
	}

	create(): Required<InsertIntoNoteButtonAction> {
		return {
			type: ButtonActionType.INSERT_INTO_NOTE,
			line: 0,
			value: 'Some text',
			templater: false,
		};
	}

	getActionLabel(): string {
		return 'Insert text into the note';
	}
}
