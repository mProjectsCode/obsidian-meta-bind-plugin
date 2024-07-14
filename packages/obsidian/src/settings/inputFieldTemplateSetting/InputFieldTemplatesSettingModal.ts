import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import type { InputFieldTemplate } from 'packages/core/src/Settings';
import type { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import InputFieldTemplatesSettingComponent from 'packages/obsidian/src/settings/inputFieldTemplateSetting/InputFieldTemplatesSettingComponent.svelte';

export class InputFieldTemplatesSettingModal extends Modal {
	readonly plugin: MetaBindPlugin;
	private component: InputFieldTemplatesSettingComponent | undefined;

	constructor(app: App, plugin: MetaBindPlugin) {
		super(app);
		this.plugin = plugin;
	}

	public onOpen(): void {
		this.contentEl.empty();
		if (this.component) {
			this.component.$destroy();
		}

		this.component = new InputFieldTemplatesSettingComponent({
			target: this.contentEl,
			props: {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				inputFieldTemplates: JSON.parse(JSON.stringify(this.plugin.settings.inputFieldTemplates)),
				modal: this,
			},
		});
	}

	public onClose(): void {
		this.contentEl.empty();
		if (this.component) {
			this.component.$destroy();
		}
	}

	public save(templates: InputFieldTemplate[]): ErrorCollection | undefined {
		const errorCollection = this.plugin.api.inputFieldParser.parseTemplates(templates);
		if (errorCollection.hasErrors()) {
			return errorCollection;
		}

		this.plugin.settings.inputFieldTemplates = templates;
		void this.plugin.saveSettings();

		return undefined;
	}
}
