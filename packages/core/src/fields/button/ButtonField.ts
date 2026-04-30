import type { MetaBind } from 'packages/core/src';
import type { NotePosition } from 'packages/core/src/config/APIConfigs';
import { RenderChildType } from 'packages/core/src/config/APIConfigs';
import type { ButtonConfig, ButtonContext } from 'packages/core/src/config/ButtonConfig';
import { ButtonClickContext, ButtonClickType } from 'packages/core/src/config/ButtonConfig';
import ButtonComponent from 'packages/core/src/utils/components/ButtonComponent.svelte';
import { Mountable } from 'packages/core/src/utils/Mountable';
import { DomHelpers, isTruthy } from 'packages/core/src/utils/Utils';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export class ButtonField extends Mountable {
	mb: MetaBind;
	config: ButtonConfig;
	filePath: string;
	isInline: boolean;
	position: NotePosition | undefined;
	buttonComponent?: ReturnType<SvelteComponent>;
	isInGroup: boolean;
	isPreview: boolean;

	constructor(
		mb: MetaBind,
		config: ButtonConfig,
		filePath: string,
		renderChildType: RenderChildType,
		position: NotePosition | undefined,
		isInGroup: boolean,
		isPreview: boolean,
	) {
		super();

		this.mb = mb;
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
				this.mb.buttonManager.addButton(this.filePath, this.config);
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
				mb: this.mb,
				icon: this.config.icon,
				variant: this.config.style,
				label: this.config.label,
				tooltip: isTruthy(this.config.tooltip) ? this.config.tooltip : undefined,
				cssStyle: this.config.cssStyle,
				backgroundImage: isTruthy(this.config.backgroundImage)
					? this.mb.internal.imagePathToUri(this.config.backgroundImage!)
					: undefined,
				onclick: async (event: MouseEvent): Promise<void> => {
					await this.mb.buttonActionRunner.runButtonActions(
						this.config,
						this.filePath,
                        this.getContext(targetEl),
						ButtonClickContext.fromMouseEvent(event, ButtonClickType.LEFT),
					);
				},
				onauxclick: async (event: MouseEvent): Promise<void> => {
					await this.mb.buttonActionRunner.runButtonActions(
						this.config,
						this.filePath,
                        this.getContext(targetEl),
						ButtonClickContext.fromMouseEvent(event, ButtonClickType.LEFT),
					);
				},
			},
		});
	}

    public getContext(target: HTMLElement): ButtonContext {
        let parent = target.parentElement;
        if (parent && this.isInline) {
            parent = parent.parentElement;
        }
		return {
			position: this.position?.getPosition(),
			isInGroup: this.isInGroup,
			isInline: this.isInline,
            parentId: parent ? parent.id : "",
		};
	}

	protected onUnmount(): void {
		if (this.buttonComponent) {
			void unmount(this.buttonComponent);
		}

		if (!this.isInline && !this.isPreview) {
			if (this.config?.id) {
				this.mb.buttonManager.removeButton(this.filePath, this.config.id);
			}
		}
	}
}
