import { ButtonParser } from '../../parsers/ButtonParser';
import { ButtonField } from './ButtonField';
import ButtonComponent from '../../utils/components/ButtonComponent.svelte';
import { type ButtonConfig, ButtonStyleType } from '../../config/ButtonConfig';
import { type IPlugin } from '../../IPlugin';

export class InlineButtonField {
	plugin: IPlugin;
	content: string;
	filePath: string;
	cleanupCallbacks: (() => void)[] = [];

	constructor(plugin: IPlugin, content: string, filePath: string) {
		this.plugin = plugin;
		this.content = content;
		this.filePath = filePath;
		this.cleanupCallbacks = [];
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

	public mount(container: HTMLElement): void {
		container.empty();
		container.addClass('mb-button-group');

		const buttonIds: string[] = ButtonParser.parseString(this.content);

		for (const buttonId of buttonIds) {
			const element = document.createElement('span');
			container.append(element);
			element.addClass('mb-button', 'mb-button-inline');
			const initialButton: ButtonComponent | undefined = this.renderInitialButton(element, buttonId);
			let button: ButtonField | undefined;

			const loadListenerCleanup = this.plugin.api.buttonManager.registerButtonLoadListener(
				this.filePath,
				buttonId,
				(buttonConfig: ButtonConfig) => {
					initialButton?.$destroy();
					button = new ButtonField(this.plugin, buttonConfig, this.filePath, true, false);
					button.mount(element);
				},
			);

			this.cleanupCallbacks.push(() => {
				initialButton?.$destroy();
				button?.unmount();
				loadListenerCleanup();
			});
		}
	}

	public unmount(): void {
		for (const cleanupCallback of this.cleanupCallbacks) {
			cleanupCallback();
		}
	}
}
