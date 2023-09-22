import { App, Modal } from 'obsidian';
import MetaBindPlugin from '../../main';
import InputFieldTemplatesSettingComponent from './InputFieldTemplatesSettingComponent.svelte';
import { InputFieldTemplate } from '../Settings';
import { ErrorCollection } from '../../utils/errors/ErrorCollection';

export class InputFieldTemplatesSettingModal extends Modal {
	private readonly plugin: MetaBindPlugin;
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
		const errorCollection = this.plugin.api.newInputFieldParser.parseTemplates(templates);
		if (errorCollection.hasErrors()) {
			return errorCollection;
		}

		this.plugin.settings.inputFieldTemplates = templates;
		this.plugin.saveSettings();

		return undefined;
	}
}
