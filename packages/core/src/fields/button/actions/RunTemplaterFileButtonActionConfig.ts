import type {
	ButtonClickContext,
	ButtonConfig,
	ButtonContext,
	RunTemplaterFileButtonAction,
} from 'packages/core/src/config/ButtonConfig';
import { ButtonActionType } from 'packages/core/src/config/ButtonConfig';
import { AbstractButtonActionConfig } from 'packages/core/src/fields/button/AbstractButtonActionConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';

export class RunTemplaterFileButtonActionConfig extends AbstractButtonActionConfig<RunTemplaterFileButtonAction> {
	constructor(plugin: IPlugin) {
		super(ButtonActionType.RUN_TEMPLATER_FILE, plugin);
	}

	async run(
		_config: ButtonConfig | undefined,
		action: RunTemplaterFileButtonAction,
		_filePath: string,
		_context: ButtonContext,
		_click: ButtonClickContext,
	): Promise<void> {
		const templateFilePath = this.plugin.api.buttonActionRunner.resolveFilePath(action.templateFile);
		void await this.plugin.internal.evaluateTemplaterTemplate(templateFilePath, templateFilePath);
	}

	create(): Required<RunTemplaterFileButtonAction> {
		return {
			type: ButtonActionType.RUN_TEMPLATER_FILE,
			templateFile: '',
		};
	}

	getActionLabel(): string {
		return 'Create a new note using Templater';
	}
}
