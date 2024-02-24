import { type IPlugin } from 'packages/core/src/IPlugin';
import { type ButtonConfig, ButtonStyleType } from 'packages/core/src/config/ButtonConfig';
import { ButtonField } from 'packages/core/src/fields/button/ButtonField';
import { DomHelpers } from 'packages/core/src/utils/Utils';
import ButtonComponent from 'packages/core/src/utils/components/ButtonComponent.svelte';
import { Mountable } from 'packages/core/src/utils/Mountable';

export class InlineButtonField extends Mountable {
	plugin: IPlugin;
	referencedIds: string[];
	filePath: string;

	constructor(plugin: IPlugin, referencedIds: string[], filePath: string) {
		super();

		this.plugin = plugin;
		this.referencedIds = referencedIds;
		this.filePath = filePath;
	}

	private renderInitialButton(element: HTMLElement, buttonId: string): ButtonComponent {
		return new ButtonComponent({
			target: element,
			props: {
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
		DomHelpers.addClass(targetEl, 'mb-button-group');

		for (const buttonId of this.referencedIds) {
			const wrapperEl = DomHelpers.createElement(targetEl, 'span', { class: 'mb-button mb-button-inline' });

			const initialButton: ButtonComponent | undefined = this.renderInitialButton(wrapperEl, buttonId);
			let button: ButtonField | undefined;

			const loadListenerCleanup = this.plugin.api.buttonManager.registerButtonLoadListener(
				this.filePath,
				buttonId,
				(buttonConfig: ButtonConfig) => {
					initialButton?.$destroy();
					button = new ButtonField(this.plugin, buttonConfig, this.filePath, true, false);
					button.mount(wrapperEl);
				},
			);

			this.registerUnmountCb(() => {
				initialButton?.$destroy();
				button?.unmount();
				loadListenerCleanup();
			});
		}
	}

	protected onUnmount(targetEl: HTMLElement): void {
		DomHelpers.empty(targetEl);
	}
}
