import { AbstractMDRC } from './AbstractMDRC';
import ButtonComponent from '../utils/components/ButtonComponent.svelte';
import type MetaBindPlugin from '../main';
import { RenderChildType } from '../config/FieldConfigs';
import { type ButtonConfig, ButtonStyleType } from '../config/ButtonConfig';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';
import { ButtonParser } from '../parsers/ButtonParser';
import { Component } from 'obsidian';

export class InlineButtonMDRC extends AbstractMDRC {
	content: string;
	buttonComponent?: ButtonComponent;
	callbackComponent: Component;

	constructor(containerEl: HTMLElement, content: string, plugin: MetaBindPlugin, filePath: string, uuid: string) {
		super(containerEl, RenderChildType.INLINE, plugin, filePath, uuid);
		this.content = content;
		this.callbackComponent = new Component();
	}

	private createErrorIndicator(el: HTMLElement): void {
		new ErrorIndicatorComponent({
			target: el,
			props: {
				app: this.plugin.app,
				errorCollection: this.errorCollection,
				declaration: this.content,
			},
		});
	}

	private async runAction(buttonConfig: ButtonConfig): Promise<void> {
		if (buttonConfig.action) {
			await this.plugin.api.buttonActionRunner.runAction(buttonConfig.action, this.filePath);
		} else if (buttonConfig.actions) {
			for (const action of buttonConfig.actions) {
				await this.plugin.api.buttonActionRunner.runAction(action, this.filePath);
			}
		} else {
			console.error('ButtonMDRC | no action defined');
		}
	}

	private render(buttonConfig: ButtonConfig, element: HTMLElement): void {
		element.empty();
		this.buttonComponent = new ButtonComponent({
			target: element,
			props: {
				variant: buttonConfig.style,
				label: buttonConfig.label,
				onClick: async (): Promise<void> => {
					await this.runAction(buttonConfig);
				},
			},
		});
	}

	private renderInitialButton(element: HTMLElement): void {
		this.buttonComponent = new ButtonComponent({
			target: element,
			props: {
				variant: ButtonStyleType.DEFAULT,
				label: 'Button ID not Found',
				error: true,
				onClick: async (): Promise<void> => {},
			},
		});
	}

	public onload(): void {
		console.log('meta-bind | InlineButtonMDRC >> onload');
		this.containerEl.empty();
		this.containerEl.addClass('mb-button-group');

		this.callbackComponent.load();

		let buttonIds: string[] = [];
		try {
			buttonIds = ButtonParser.parseString(this.content);
		} catch (e) {
			this.errorCollection.add(e);
			this.createErrorIndicator(this.containerEl);
			return;
		}

		for (const buttonId of buttonIds) {
			const element = this.containerEl.createSpan();
			element.addClass('mb-button', 'mb-button-inline');

			this.renderInitialButton(element);

			this.callbackComponent.register(
				this.plugin.api.buttonManager.registerButtonLoadListener(
					this.filePath,
					buttonId,
					(buttonConfig: ButtonConfig) => this.render(buttonConfig, element),
				),
			);
		}
	}

	public onunload(): void {
		console.log('meta-bind | InlineButtonMDRC >> onunload');
		this.callbackComponent.unload();
		this.buttonComponent?.$destroy();
	}
}
