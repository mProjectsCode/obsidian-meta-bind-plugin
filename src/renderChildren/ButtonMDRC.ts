import { AbstractMDRC } from './AbstractMDRC';
import { parseYaml } from 'obsidian';
import { RenderChildType } from '../config/FieldConfigs';
import type MetaBindPlugin from '../main';
import { type ButtonConfig, ButtonConfigValidator } from '../config/ButtonConfig';
import { ErrorLevel, MetaBindButtonError } from '../utils/errors/MetaBindErrors';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';
import ButtonComponent from '../utils/components/ButtonComponent.svelte';
import { DocsUtils } from '../utils/DocsUtils';

export class ButtonMDRC extends AbstractMDRC {
	content: string;
	buttonComponent?: ButtonComponent;
	buttonConfig?: ButtonConfig;

	constructor(containerEl: HTMLElement, content: string, plugin: MetaBindPlugin, filePath: string, uuid: string) {
		super(containerEl, RenderChildType.BLOCK, plugin, filePath, uuid);
		this.content = content;
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
			console.error('meta-bind | ButtonMDRC >> no action defined');
		}
	}

	public onload(): void {
		console.log('meta-bind | ButtonMDRC >> onload');
		this.containerEl.addClass('mb-button', 'mb-button-block');
		this.plugin.mdrcManager.registerMDRC(this);

		const yamlContent = parseYaml(this.content) as unknown;
		const validationResult = ButtonConfigValidator.safeParse(yamlContent);

		if (!validationResult.success) {
			this.errorCollection.add(
				new MetaBindButtonError({
					errorLevel: ErrorLevel.ERROR,
					effect: 'can not parse button config',
					cause: 'zod validation failed. Check your button syntax',
					positionContext: validationResult.error.message,
					docs: [DocsUtils.linkToButtonConfig()],
				}),
			);
			this.createErrorIndicator(this.containerEl);
			return;
		}

		this.buttonConfig = validationResult.data;

		if (this.buttonConfig.id) {
			this.plugin.api.buttonManager.addButton(this.filePath, this.buttonConfig);
		}
		if (this.buttonConfig.hidden) {
			return;
		}

		this.buttonComponent = new ButtonComponent({
			target: this.containerEl,
			props: {
				variant: this.buttonConfig.style,
				label: this.buttonConfig.label,
				onClick: async (): Promise<void> => {
					await this.runAction(this.buttonConfig!);
				},
			},
		});
	}

	public onunload(): void {
		console.log('meta-bind | ButtonMDRC >> onunload');
		if (this.buttonConfig?.id) {
			this.plugin.api.buttonManager.removeButton(this.filePath, this.buttonConfig.id);
		}
		this.buttonComponent?.$destroy();
		this.containerEl.empty();
		this.containerEl.addClass('mb-error');
		this.containerEl.innerText = 'unloaded meta bind button';
		this.plugin.mdrcManager.unregisterMDRC(this);
	}
}
