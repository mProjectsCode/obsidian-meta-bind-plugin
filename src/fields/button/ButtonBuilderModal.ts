import { Modal } from 'obsidian';
import type MetaBindPlugin from '../../main';
import ButtonBuilderModalComponent from './ButtonBuilderModalComponent.svelte';
import { type ButtonConfig } from '../../config/ButtonConfig';

export class ButtonBuilderModal extends Modal {
	plugin: MetaBindPlugin;
	component?: ButtonBuilderModalComponent;
	onOkay: (config: ButtonConfig) => void;
	submitText: string;

	constructor(plugin: MetaBindPlugin, onOkay: (config: ButtonConfig) => void, submitText: string) {
		super(plugin.app);
		this.plugin = plugin;
		this.onOkay = onOkay;
		this.submitText = submitText;
	}

	public onOpen(): void {
		this.contentEl.empty();
		if (this.component) {
			this.component.$destroy();
		}

		this.component = new ButtonBuilderModalComponent({
			target: this.contentEl,
			props: {
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

	public okay(config: ButtonConfig): void {
		this.close();
		this.onOkay(config);
	}

	public cancel(): void {
		this.close();
	}
}
