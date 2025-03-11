import type { MetaBind } from 'packages/core/src';
import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	RegexpReplaceInNoteButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';

export class RegexpReplaceInNoteButtonActionConfig extends AbstractButtonActionConfig<RegexpReplaceInNoteButtonAction> {
	constructor(mb: MetaBind) {
		super(ButtonActionType.REGEXP_REPLACE_IN_NOTE, mb);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: RegexpReplaceInNoteButtonAction,
		filePath: string,
		_context: ButtonContext,
		_click: ButtonClickContext,
	): Promise<void> {
		if (action.regexp === '') {
			throw new Error('Regexp cannot be empty');
		}

		await this.mb.file.atomicModify(filePath, content => {
			return content.replace(new RegExp(action.regexp, action.regexpFlags ?? 'g'), action.replacement);
		});
	}

	create(): Required<RegexpReplaceInNoteButtonAction> {
		return {
			type: ButtonActionType.REGEXP_REPLACE_IN_NOTE,
			regexp: '([A-Z])\\w+',
			replacement: 'Replacement text',
			regexpFlags: 'g',
		};
	}

	getActionLabel(): string {
		return 'Replace text in note using regexp';
	}
}
