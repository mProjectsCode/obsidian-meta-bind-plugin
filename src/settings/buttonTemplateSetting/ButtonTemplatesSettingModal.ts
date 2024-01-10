import { type App, Modal } from 'obsidian';
import type MetaBindPlugin from '../../main';
import ButtonTemplatesSettingComponent from './ButtonTemplatesSettingComponent.svelte';
import type { ErrorCollection } from '../../utils/errors/ErrorCollection';
import { type ButtonConfig } from '../../config/ButtonConfig';
import { deepCopy } from '../../utils/Utils';

export class ButtonTemplatesSettingModal extends Modal {
	readonly plugin: MetaBindPlugin;
	private component: ButtonTemplatesSettingComponent | undefined;

	constructor(app: App, plugin: MetaBindPlugin) {
		super(app);
		this.plugin = plugin;
	}

	public onOpen(): void {
		this.contentEl.empty();
		if (this.component) {
			this.component.$destroy();
		}

		this.component = new ButtonTemplatesSettingComponent({
			target: this.contentEl,
			props: {
				buttonConfigs: deepCopy(this.plugin.settings.buttonTemplates),
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

	public save(templates: ButtonConfig[]): ErrorCollection | undefined {
		const errorCollection = this.plugin.api.buttonManager.setButtonTemplates(templates);
		if (errorCollection.hasErrors()) {
			return errorCollection;
		}

		this.plugin.settings.buttonTemplates = templates;
		void this.plugin.saveSettings();

		return undefined;
	}
}
