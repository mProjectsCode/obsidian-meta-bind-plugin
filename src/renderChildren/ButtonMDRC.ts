import { AbstractMDRC } from './AbstractMDRC';
import { parseYaml } from 'obsidian';
import { RenderChildType } from '../config/FieldConfigs';
import type MetaBindPlugin from '../main';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';
import { ButtonField } from '../fields/button/ButtonField';

export class ButtonMDRC extends AbstractMDRC {
	content: string;
	buttonField?: ButtonField;

	constructor(containerEl: HTMLElement, content: string, plugin: MetaBindPlugin, filePath: string, uuid: string) {
		super(containerEl, RenderChildType.BLOCK, plugin, filePath, uuid);
		this.content = content;
	}

	public onload(): void {
		console.log('meta-bind | ButtonMDRC >> onload');
		this.plugin.mdrcManager.registerMDRC(this);
		this.containerEl.className = '';

		const yamlContent = parseYaml(this.content) as unknown;

		this.buttonField = new ButtonField(this.plugin, yamlContent, this.filePath, false);
		try {
			this.buttonField.mount(this.containerEl);
		} catch (e) {
			this.errorCollection.add(e);

			new ErrorIndicatorComponent({
				target: this.containerEl,
				props: {
					app: this.plugin.app,
					errorCollection: this.errorCollection,
					declaration: this.content,
				},
			});
		}
	}

	public onunload(): void {
		console.log('meta-bind | ButtonMDRC >> onunload');
		this.buttonField?.unmount();
		this.containerEl.empty();
		this.containerEl.className = '';
		this.containerEl.addClass('mb-error');
		this.containerEl.innerText = 'unloaded meta bind button';
		this.plugin.mdrcManager.unregisterMDRC(this);
	}
}
