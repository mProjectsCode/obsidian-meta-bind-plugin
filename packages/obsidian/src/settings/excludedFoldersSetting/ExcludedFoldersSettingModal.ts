import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import type { ObsMetaBind } from 'packages/obsidian/src/main';
import ExcludedFoldersSettingComponent from 'packages/obsidian/src/settings/excludedFoldersSetting/ExcludedFoldersSettingComponent.svelte';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export class ExcludedFoldersSettingModal extends Modal {
	private readonly mb: ObsMetaBind;
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

		this.component = mount(ExcludedFoldersSettingComponent, {
			target: this.contentEl,
			props: {
				excludedFolders: structuredClone(this.mb.getSettings().excludedFolders),
				modal: this,
				mb: this.mb,
			},
		});
	}

	public onClose(): void {
		this.contentEl.empty();
		if (this.component) {
			void unmount(this.component);
		}
	}

	public save(folders: string[]): ErrorCollection | undefined {
		for (const folder of folders) {
			if (folder === '') {
				const errorCollection = new ErrorCollection('Excluded folders');

				errorCollection.add(new Error(`Invalid Folder Path '${folder}'. Folder path may not be empty.`));

				return errorCollection;
			}
		}

		this.mb.updateSettings(settings => {
			settings.excludedFolders = folders;
		});

		return undefined;
	}
}
