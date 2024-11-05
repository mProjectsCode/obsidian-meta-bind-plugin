import type { NotePosition } from 'packages/core/src/config/APIConfigs';
import { RenderChildType } from 'packages/core/src/config/APIConfigs';
import type { ButtonConfig, ButtonContext } from 'packages/core/src/config/ButtonConfig';
import { ButtonClickType } from 'packages/core/src/config/ButtonConfig';
import type { IPlugin } from 'packages/core/src/IPlugin';
import ButtonComponent from 'packages/core/src/utils/components/ButtonComponent.svelte';
import { Mountable } from 'packages/core/src/utils/Mountable';
import { DomHelpers, isTruthy } from 'packages/core/src/utils/Utils';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export class ButtonField extends Mountable {
	plugin: IPlugin;
	config: ButtonConfig;
	filePath: string;
	isInline: boolean;
	position: NotePosition | undefined;
	buttonComponent?: ReturnType<SvelteComponent>;
	isInGroup: boolean;
	isPreview: boolean;

	constructor(
		plugin: IPlugin,
		config: ButtonConfig,
		filePath: string,
		renderChildType: RenderChildType,
		position: NotePosition | undefined,
		isInGroup: boolean,
		isPreview: boolean,
	) {
		super();

		this.plugin = plugin;
		this.config = config;
		this.filePath = filePath;
		this.isInline = renderChildType === RenderChildType.INLINE;
		this.position = position;
		this.isInGroup = isInGroup;
		this.isPreview = isPreview;
	}

	protected onMount(targetEl: HTMLElement): void {
		DomHelpers.empty(targetEl);
		DomHelpers.removeAllClasses(targetEl);
		DomHelpers.addClasses(targetEl, ['mb-button', this.isInline ? 'mb-button-inline' : 'mb-button-block']);

		if (!this.isInline && !this.isPreview && !this.isInGroup) {
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

		this.buttonComponent = mount(ButtonComponent, {
			target: targetEl,
			props: {
				plugin: this.plugin,
				icon: this.config.icon,
				variant: this.config.style,
				label: this.config.label,
				tooltip: isTruthy(this.config.tooltip) ? this.config.tooltip : this.config.label,
				onclick: async (event: MouseEvent): Promise<void> => {
					await this.plugin.api.buttonActionRunner.runButtonActions(
						this.config,
						this.filePath,
						this.getContext(),
						this.plugin.api.buttonActionRunner.mouseEventToClickContext(event, ButtonClickType.LEFT),
					);
				},
				onauxclick: async (event: MouseEvent): Promise<void> => {
					await this.plugin.api.buttonActionRunner.runButtonActions(
						this.config,
						this.filePath,
						this.getContext(),
						this.plugin.api.buttonActionRunner.mouseEventToClickContext(event, ButtonClickType.MIDDLE),
					);
				},
			},
		});
	}

	public getContext(): ButtonContext {
		return {
			position: this.position?.getPosition(),
			isInGroup: this.isInGroup,
			isInline: this.isInline,
		};
	}

	protected onUnmount(): void {
		if (this.buttonComponent) {
			unmount(this.buttonComponent);
		}

		if (!this.isInline && !this.isPreview) {
			if (this.config?.id) {
				this.plugin.api.buttonManager.removeButton(this.filePath, this.config.id);
			}
		}
	}
}
