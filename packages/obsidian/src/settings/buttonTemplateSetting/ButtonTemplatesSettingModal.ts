import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import type { ButtonConfig } from 'packages/core/src/config/ButtonConfig';
import type { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import { deepCopy } from 'packages/core/src/utils/Utils';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import ButtonTemplatesSettingComponent from 'packages/obsidian/src/settings/buttonTemplateSetting/ButtonTemplatesSettingComponent.svelte';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export class ButtonTemplatesSettingModal extends Modal {
	readonly plugin: MetaBindPlugin;
	private component: ReturnType<SvelteComponent> | undefined;

	constructor(app: App, plugin: MetaBindPlugin) {
		super(app);
		this.plugin = plugin;
	}

	public onOpen(): void {
		this.contentEl.empty();
		if (this.component) {
			void unmount(this.component);
		}

		this.component = mount(ButtonTemplatesSettingComponent, {
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
			void unmount(this.component);
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
