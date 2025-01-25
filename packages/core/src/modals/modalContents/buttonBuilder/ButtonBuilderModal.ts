import type { ButtonConfig } from 'packages/core/src/config/ButtonConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';
import { ModalContent } from 'packages/core/src/modals/ModalContent';
import ButtonBuilderModalComponent from 'packages/core/src/modals/modalContents/buttonBuilder/ButtonBuilderModalComponent.svelte';
import { DomHelpers } from 'packages/core/src/utils/Utils';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export interface ButtonBuilderModalOptions {
	onOkay: (config: ButtonConfig) => void;
	submitText: string;
	config?: ButtonConfig;
}

export class ButtonBuilderModal extends ModalContent {
	plugin: IPlugin;

	component?: ReturnType<SvelteComponent>;
	options: ButtonBuilderModalOptions;

	constructor(plugin: IPlugin, options: ButtonBuilderModalOptions) {
		super();
		this.plugin = plugin;

		this.options = options;
	}

	protected onMount(targetEl: HTMLElement): void {
		DomHelpers.empty(targetEl);
		if (this.component) {
			void unmount(this.component);
		}

		this.component = mount(ButtonBuilderModalComponent, {
			target: targetEl,
			props: {
				plugin: this.plugin,
				modal: this,
				buttonConfig: this.options.config ?? this.plugin.api.buttonActionRunner.createDefaultButtonConfig(),
			},
		});
	}

	protected onUnmount(targetEl: HTMLElement): void {
		DomHelpers.empty(targetEl);
		if (this.component) {
			void unmount(this.component);
		}
	}

	public okay(config: ButtonConfig): void {
		this.closeModal();
		this.options.onOkay(config);
	}

	public cancel(): void {
		this.closeModal();
	}
}
