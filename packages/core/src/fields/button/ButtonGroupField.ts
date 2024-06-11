import { type IPlugin } from 'packages/core/src/IPlugin';
import { type ButtonConfig, ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
import { ButtonField } from 'packages/core/src/fields/button/ButtonField';
import { DomHelpers } from 'packages/core/src/utils/Utils';
import ButtonComponent from 'packages/core/src/utils/components/ButtonComponent.svelte';
import { Mountable } from 'packages/core/src/utils/Mountable';
import { type NotePosition, RenderChildType } from 'packages/core/src/config/APIConfigs';

export class ButtonGroupField extends Mountable {
	plugin: IPlugin;
	referencedIds: string[];
	filePath: string;
	renderChildType: RenderChildType;
	notePosition: NotePosition | undefined;

	constructor(
		plugin: IPlugin,
		referencedIds: string[],
		filePath: string,
		renderChildType: RenderChildType,
		notePosition: NotePosition | undefined,
	) {
		super();

		this.plugin = plugin;
		this.referencedIds = referencedIds;
		this.filePath = filePath;
		this.renderChildType = renderChildType;
		this.notePosition = notePosition;
	}

	private renderInitialButton(element: HTMLElement, buttonId: string): ButtonComponent {
		DomHelpers.removeAllClasses(element);
		DomHelpers.addClasses(element, [
			'mb-button',
			this.renderChildType === RenderChildType.INLINE ? 'mb-button-inline' : 'mb-button-block',
		]);

		return new ButtonComponent({
			target: element,
			props: {
				plugin: this.plugin,
				variant: ButtonStyleType.DEFAULT,
				label: 'Button ID not Found',
				tooltip: `No button with id '${buttonId}' found`,
				error: true,
				onClick: async (): Promise<void> => {},
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

			let initialButton: ButtonComponent | undefined = this.renderInitialButton(wrapperEl, buttonId);
			let button: ButtonField | undefined;

			const loadListenerCleanup = this.plugin.api.buttonManager.registerButtonLoadListener(
				this.filePath,
				buttonId,
				(buttonConfig: ButtonConfig) => {
					initialButton?.$destroy();
					initialButton = undefined;
					button = new ButtonField(
						this.plugin,
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
				initialButton?.$destroy();
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
