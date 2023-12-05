import { ButtonActionRunner } from './ButtonActionRunner';
import { type QuickSwitcherButtonAction, type TemplaterCreateNoteButtonAction } from '../../config/ButtonConfig';
import { TFile, TFolder } from 'obsidian';
import type MetaBindPlugin from '../../main';

export class ObsidianButtonActionRunner extends ButtonActionRunner {
	plugin: MetaBindPlugin;

	constructor(plugin: MetaBindPlugin) {
		super(plugin);
		this.plugin = plugin;
	}

	async runTemplaterCreateNoteAction(action: TemplaterCreateNoteButtonAction): Promise<void> {
		// eslint-disable
		const templater = this.plugin.app.plugins.getPlugin('templater-obsidian');
		if (!templater) {
			throw new Error('Templater plugin not found');
		}
		// @ts-ignore
		const templaterAPI = templater.templater as {
			// https://github.com/SilentVoid13/Templater/blob/b8fdc3a7476de1da08b7933373f8118fdb0c5032/src/core/Templater.ts#L110C27-L110C27
			create_new_note_from_template: (
				templateFile: TFile,
				folder?: TFolder,
				fileName?: string,
				openNote?: boolean,
			) => Promise<void>;
		};

		const templateFile = this.plugin.app.vault.getAbstractFileByPath(action.templateFile);
		if (!templateFile || !(templateFile instanceof TFile)) {
			throw new Error(`Template file not found: ${action.templateFile}`);
		}

		if (action.folderPath === undefined) {
			await templaterAPI.create_new_note_from_template(
				templateFile,
				undefined,
				action.fileName,
				action.openNote ?? true,
			);
		} else {
			const folder = this.plugin.app.vault.getAbstractFileByPath(action.folderPath);
			if (!folder || !(folder instanceof TFolder)) {
				throw new Error(`Folder not found: ${action.folderPath}`);
			}
			await templaterAPI.create_new_note_from_template(
				templateFile,
				folder,
				action.fileName,
				action.openNote ?? true,
			);
		}
	}

	public async runQuickSwitcherAction(_action: QuickSwitcherButtonAction): Promise<void> {}
}
