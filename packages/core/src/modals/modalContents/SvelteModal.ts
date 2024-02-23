import { ModalContent } from 'packages/core/src/modals/ModalContent';
import { type SvelteComponent } from 'svelte';
import { DomHelpers } from 'packages/core/src/utils/Utils';

export type SvelteModalComponentFn<T extends SvelteComponent> = (modal: SvelteModal<T>, targetEl: HTMLElement) => T;

export class SvelteModal<T extends SvelteComponent> extends ModalContent {
	component: T | undefined;
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
		this.component?.$destroy();

		DomHelpers.empty(targetEl);
	}
}
