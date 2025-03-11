import type { MetaBind } from 'packages/core/src';
import type { NotePosition } from 'packages/core/src/config/APIConfigs';
import { RenderChildType } from 'packages/core/src/config/APIConfigs';
import type { ButtonConfig } from 'packages/core/src/config/ButtonConfig';
import { ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
import { ButtonField } from 'packages/core/src/fields/button/ButtonField';
import ButtonComponent from 'packages/core/src/utils/components/ButtonComponent.svelte';
import { Mountable } from 'packages/core/src/utils/Mountable';
import { DomHelpers } from 'packages/core/src/utils/Utils';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export class ButtonGroupField extends Mountable {
	mb: MetaBind;
	referencedIds: string[];
	filePath: string;
	renderChildType: RenderChildType;
	notePosition: NotePosition | undefined;

	constructor(
		mb: MetaBind,
		referencedIds: string[],
		filePath: string,
		renderChildType: RenderChildType,
		notePosition: NotePosition | undefined,
	) {
		super();

		this.mb = mb;
		this.referencedIds = referencedIds;
		this.filePath = filePath;
		this.renderChildType = renderChildType;
		this.notePosition = notePosition;
	}

	private renderInitialButton(element: HTMLElement, buttonId: string): ReturnType<SvelteComponent> {
		DomHelpers.removeAllClasses(element);
		DomHelpers.addClasses(element, [
			'mb-button',
			this.renderChildType === RenderChildType.INLINE ? 'mb-button-inline' : 'mb-button-block',
		]);

		return mount(ButtonComponent, {
			target: element,
			props: {
				mb: this.mb,
				variant: ButtonStyleType.DEFAULT,
				label: 'Button ID not Found',
				tooltip: `No button with id '${buttonId}' found`,
				error: true,
				onclick: async (): Promise<void> => {},
			},
		});
	}

	protected onMount(targetEl: HTMLElement): void {
		DomHelpers.empty(targetEl);
		DomHelpers.addClasses(targetEl, [
			'mb-button-group',
			this.renderChildType === RenderChildType.INLINE ? 'mb-button-group-inline' : 'mb-button-group-block',
		]);

		for (const buttonId of this.referencedIds) {
			const wrapperEl = DomHelpers.createElement(targetEl, 'span');

			let initialButton: ReturnType<SvelteComponent> | undefined = this.renderInitialButton(wrapperEl, buttonId);
			let button: ButtonField | undefined;

			const loadListenerCleanup = this.mb.buttonManager.registerButtonLoadListener(
				this.filePath,
				buttonId,
				(buttonConfig: ButtonConfig) => {
					if (initialButton) {
						void unmount(initialButton);
					}
					initialButton = undefined;
					button = new ButtonField(
						this.mb,
						buttonConfig,
						this.filePath,
						this.renderChildType,
						this.notePosition,
						true,
						false,
					);
					button.mount(wrapperEl);
				},
			);

			this.registerUnmountCb(() => {
				if (initialButton) {
					void unmount(initialButton);
				}
				initialButton = undefined;
				button?.unmount();
				loadListenerCleanup();
			});
		}
	}

	protected onUnmount(targetEl: HTMLElement): void {
		DomHelpers.empty(targetEl);
	}
}
