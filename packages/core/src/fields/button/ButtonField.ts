import { type IPlugin } from 'packages/core/src/IPlugin';
import { type ButtonConfig } from 'packages/core/src/config/ButtonConfig';
import { V_ButtonConfig } from 'packages/core/src/config/ButtonConfigValidators';
import { DocsUtils } from 'packages/core/src/utils/DocsUtils';
import { DomHelpers, isTruthy } from 'packages/core/src/utils/Utils';
import ButtonComponent from 'packages/core/src/utils/components/ButtonComponent.svelte';
import { ErrorLevel, MetaBindButtonError } from 'packages/core/src/utils/errors/MetaBindErrors';
import { fromZodError } from 'zod-validation-error';

export class ButtonField {
	plugin: IPlugin;
	unvalidatedConfig: unknown;
	filePath: string;
	inline: boolean;
	buttonComponent?: ButtonComponent;
	config: ButtonConfig | undefined;
	isPreview: boolean;

	constructor(plugin: IPlugin, config: unknown, filePath: string, inline: boolean, isPreview: boolean) {
		this.plugin = plugin;
		this.unvalidatedConfig = config;
		this.filePath = filePath;
		this.inline = inline;
		this.config = undefined;
		this.isPreview = isPreview;
	}

	private renderButton(container: HTMLElement): void {
		if (this.config === undefined) {
			return;
		}

		const config = this.config;

		this.buttonComponent = new ButtonComponent({
			target: container,
			props: {
				variant: config.style,
				label: config.label,
				tooltip: isTruthy(config.tooltip) ? config.tooltip : config.label,
				onClick: async (): Promise<void> => {
					await this.plugin.api.buttonActionRunner.runButtonAction(config, this.filePath);
				},
			},
		});
	}

	public mount(wrapperEl: HTMLElement): void {
		DomHelpers.empty(wrapperEl);
		DomHelpers.addClasses(wrapperEl, ['mb-button', this.inline ? 'mb-button-inline' : 'mb-button-block']);

		const validationResult = V_ButtonConfig.safeParse(this.unvalidatedConfig);

		if (!validationResult.success) {
			const niceError = fromZodError(validationResult.error, {
				unionSeparator: '\nOR ',
				issueSeparator: ' AND ',
				prefix: null,
			});

			throw new MetaBindButtonError({
				errorLevel: ErrorLevel.ERROR,
				effect: 'can not parse button config',
				cause: 'zod validation failed. Check your button syntax',
				positionContext: niceError.message,
				docs: [DocsUtils.linkToButtonConfig()],
			});
		}

		this.config = validationResult.data;

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
				wrapperEl,
				this.config.class.split(' ').filter(x => x !== ''),
			);
		}

		this.renderButton(wrapperEl);
	}

	public unmount(): void {
		this.buttonComponent?.$destroy();

		if (!this.inline) {
			if (this.config?.id) {
				this.plugin.api.buttonManager.removeButton(this.filePath, this.config.id);
			}
		}
	}
}
