import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import { ErrorCollection } from 'packages/core/src/utils/errors/ErrorCollection';
import type MetaBindPlugin from 'packages/obsidian/src/main';
import ExcludedFoldersSettingComponent from 'packages/obsidian/src/settings/excludedFoldersSetting/ExcludedFoldersSettingComponent.svelte';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export class ExcludedFoldersSettingModal extends Modal {
	private readonly plugin: MetaBindPlugin;
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

		this.component = mount(ExcludedFoldersSettingComponent, {
			target: this.contentEl,
			props: {
				excludedFolders: this.plugin.settings.excludedFolders.slice(),
				modal: this,
				plugin: this.plugin,
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

		this.plugin.settings.excludedFolders = folders;
		void this.plugin.saveSettings();

		return undefined;
	}
}
