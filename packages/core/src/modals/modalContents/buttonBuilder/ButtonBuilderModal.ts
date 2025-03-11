import type { MetaBind } from 'packages/core/src';
import type { ButtonConfig } from 'packages/core/src/config/ButtonConfig';
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
	mb: MetaBind;

	component?: ReturnType<SvelteComponent>;
	options: ButtonBuilderModalOptions;

	constructor(mb: MetaBind, options: ButtonBuilderModalOptions) {
		super();
		this.mb = mb;

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
				mb: this.mb,
				modal: this,
				buttonConfig: this.options.config ?? this.mb.buttonActionRunner.createDefaultButtonConfig(),
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
