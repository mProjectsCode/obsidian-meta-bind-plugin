import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import type { InputFieldTemplate } from 'packages/core/src/Settings';
import type { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import type { ObsMetaBind } from 'packages/obsidian/src/main';
import InputFieldTemplatesSettingComponent from 'packages/obsidian/src/settings/inputFieldTemplateSetting/InputFieldTemplatesSettingComponent.svelte';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export class InputFieldTemplatesSettingModal extends Modal {
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

		this.component = mount(InputFieldTemplatesSettingComponent, {
			target: this.contentEl,
			props: {
				inputFieldTemplates: structuredClone(this.mb.getSettings().inputFieldTemplates),
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

	public save(templates: InputFieldTemplate[]): ErrorCollection | undefined {
		const errorCollection = this.mb.inputFieldParser.parseTemplates(templates);
		if (errorCollection.hasErrors()) {
			return errorCollection;
		}

		this.mb.updateSettings(settings => {
			settings.inputFieldTemplates = templates;
		});

		return undefined;
	}
}
