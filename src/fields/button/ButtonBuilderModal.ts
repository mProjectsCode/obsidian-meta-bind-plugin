import { Modal } from 'obsidian';
import type MetaBindPlugin from '../../main';
import ButtonBuilderModalComponent from './ButtonBuilderModalComponent.svelte';
import { type ButtonConfig } from '../../config/ButtonConfig';

export interface ButtonBuilderModalOptions {
	plugin: MetaBindPlugin;
	onOkay: (config: ButtonConfig) => void;
	submitText: string;
	config?: ButtonConfig;
}

export class ButtonBuilderModal extends Modal {
	plugin: MetaBindPlugin;
	component?: ButtonBuilderModalComponent;
	onOkay: (config: ButtonConfig) => void;
	submitText: string;
	config?: ButtonConfig;

	constructor(options: ButtonBuilderModalOptions) {
		super(options.plugin.app);
		this.plugin = options.plugin;
		this.onOkay = options.onOkay;
		this.submitText = options.submitText;
		this.config = options.config;
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
				buttonConfig: this.config ?? this.plugin.api.buttonActionRunner.createDefaultButtonConfig(),
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
