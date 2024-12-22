import { ModalContent } from 'packages/core/src/modals/ModalContent';
import { DomHelpers } from 'packages/core/src/utils/Utils';
import type { Component as SvelteComponent } from 'svelte';
import { unmount } from 'svelte';

export type SvelteModalComponentFn<T extends SvelteComponent> = (
	modal: SvelteModalContent<T>,
	targetEl: HTMLElement,
) => ReturnType<T>;

export class SvelteModalContent<T extends SvelteComponent> extends ModalContent {
	component: ReturnType<T> | undefined;
	createComponent: SvelteModalComponentFn<T>;

	constructor(createComponent: SvelteModalComponentFn<T>) {
		super();

		this.createComponent = createComponent;
	}

	protected onMount(targetEl: HTMLElement): void {
		DomHelpers.empty(targetEl);

		this.component = this.createComponent(this, targetEl);
	}

	protected onUnmount(targetEl: HTMLElement): void {
		if (this.component) {
			void unmount(this.component);
		}

		DomHelpers.empty(targetEl);
	}
}
