import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import type { ButtonConfig } from 'packages/core/src/config/ButtonConfig';
import type { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import type { ObsMetaBind } from 'packages/obsidian/src/main';
import ButtonTemplatesSettingComponent from 'packages/obsidian/src/settings/buttonTemplateSetting/ButtonTemplatesSettingComponent.svelte';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export class ButtonTemplatesSettingModal extends Modal {
	readonly mb: ObsMetaBind;
	private component: ReturnType<SvelteComponent> | undefined;

	constructor(app: App, mb: ObsMetaBind) {
		super(app);
		this.mb = mb;
	}

	public onOpen(): void {
		this.contentEl.empty();
		if (this.component) {
			void unmount(this.component);
		}

		this.component = mount(ButtonTemplatesSettingComponent, {
			target: this.contentEl,
			props: {
				buttonConfigs: structuredClone(this.mb.getSettings().buttonTemplates),
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
		const errorCollection = this.mb.buttonManager.setButtonTemplates(templates);
		if (errorCollection.hasErrors()) {
			return errorCollection;
		}

		this.mb.updateSettings(settings => {
			settings.buttonTemplates = templates;
		});

		return undefined;
	}
}
