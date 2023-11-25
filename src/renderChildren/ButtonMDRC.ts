import { AbstractMDRC } from './AbstractMDRC';
import { parseYaml } from 'obsidian';
import { RenderChildType } from '../config/FieldConfigs';
import type MetaBindPlugin from '../main';
import { type ButtonConfig, ButtonConfigValidator } from '../config/ButtonConfig';
import { ErrorLevel, MetaBindButtonError } from '../utils/errors/MetaBindErrors';
import ErrorIndicatorComponent from '../utils/errors/ErrorIndicatorComponent.svelte';
import ButtonComponent from '../utils/components/ButtonComponent.svelte';

export class ButtonMDRC extends AbstractMDRC {
	content: string;
	buttonComponent?: ButtonComponent;

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
			console.error('ButtonMDRC | no action defined');
		}
	}

	public onload(): void {
		console.log('ButtonMDRC | onload');

		const yamlContent = parseYaml(this.content) as unknown;
		const validationResult = ButtonConfigValidator.safeParse(yamlContent);

		if (!validationResult.success) {
			this.errorCollection.add(
				new MetaBindButtonError({
					errorLevel: ErrorLevel.CRITICAL,
					effect: 'can not parse button config',
					cause: validationResult.error,
				}),
			);
			this.createErrorIndicator(this.containerEl);
			return;
		}

		const buttonConfig: ButtonConfig = validationResult.data;

		this.buttonComponent = new ButtonComponent({
			target: this.containerEl,
			props: {
				variant: buttonConfig.style,
				label: buttonConfig.label,
				onClick: async (): Promise<void> => {
					await this.runAction(buttonConfig);
				},
			},
		});
	}

	public onunload(): void {
		console.log('ButtonMDRC | onunload');
		this.buttonComponent?.$destroy();
	}
}
