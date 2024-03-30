import { type IPlugin } from 'packages/core/src/IPlugin';
import { type ButtonConfig } from 'packages/core/src/config/ButtonConfig';
import { DomHelpers, isTruthy } from 'packages/core/src/utils/Utils';
import ButtonComponent from 'packages/core/src/utils/components/ButtonComponent.svelte';
import { Mountable } from 'packages/core/src/utils/Mountable';
import { type NotePosition, RenderChildType } from 'packages/core/src/config/FieldConfigs';

export class ButtonField extends Mountable {
	plugin: IPlugin;
	config: ButtonConfig;
	filePath: string;
	inline: boolean;
	position: NotePosition | undefined;
	buttonComponent?: ButtonComponent;
	isPreview: boolean;

	constructor(
		plugin: IPlugin,
		config: ButtonConfig,
		filePath: string,
		renderChildType: RenderChildType,
		position: NotePosition | undefined,
		isPreview: boolean,
	) {
		super();

		this.plugin = plugin;
		this.config = config;
		this.filePath = filePath;
		this.inline = renderChildType === RenderChildType.INLINE;
		this.position = position;
		this.isPreview = isPreview;
	}

	protected onMount(targetEl: HTMLElement): void {
		DomHelpers.empty(targetEl);
		DomHelpers.removeAllClasses(targetEl);
		DomHelpers.addClasses(targetEl, ['mb-button', this.inline ? 'mb-button-inline' : 'mb-button-block']);

		if (!this.inline && !this.isPreview) {
			if (this.config.id) {
				this.plugin.api.buttonManager.addButton(this.filePath, this.config);
			}
			if (this.config.hidden) {
				return;
			}
		}

		if (this.config.class) {
			DomHelpers.addClasses(
				targetEl,
				this.config.class.split(' ').filter(x => x !== ''),
			);
		}

		this.buttonComponent = new ButtonComponent({
			target: targetEl,
			props: {
				plugin: this.plugin,
				icon: this.config.icon,
				variant: this.config.style,
				label: this.config.label,
				tooltip: isTruthy(this.config.tooltip) ? this.config.tooltip : this.config.label,
				onClick: async (): Promise<void> => {
					await this.plugin.api.buttonActionRunner.runButtonAction(
						this.config,
						this.filePath,
						this.inline,
						this.position,
					);
				},
			},
		});
	}

	protected onUnmount(): void {
		this.buttonComponent?.$destroy();

		if (!this.inline && !this.isPreview) {
			if (this.config?.id) {
				this.plugin.api.buttonManager.removeButton(this.filePath, this.config.id);
			}
		}
	}
}
