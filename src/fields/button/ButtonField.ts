import { type ButtonConfig } from '../../config/ButtonConfig';
import ButtonComponent from '../../utils/components/ButtonComponent.svelte';
import { type IPlugin } from '../../IPlugin';
import { V_ButtonConfig } from '../../config/ButtonConfigValidators';
import { ErrorLevel, MetaBindButtonError } from '../../utils/errors/MetaBindErrors';
import { DocsUtils } from '../../utils/DocsUtils';
import { isTruthy } from '../../utils/Utils';
import { fromZodError } from 'zod-validation-error';

export class ButtonField {
	plugin: IPlugin;
	unvalidatedConfig: unknown;
	filePath: string;
	inline: boolean;
	buttonComponent?: ButtonComponent;
	config: ButtonConfig | undefined;

	constructor(plugin: IPlugin, config: unknown, filePath: string, inline: boolean) {
		this.plugin = plugin;
		this.unvalidatedConfig = config;
		this.filePath = filePath;
		this.inline = inline;
		this.config = undefined;
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

	public mount(container: HTMLElement): void {
		container.empty();
		container.addClass('mb-button', this.inline ? 'mb-button-inline' : 'mb-button-block');
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

		if (!this.inline) {
			if (this.config.id) {
				this.plugin.api.buttonManager.addButton(this.filePath, this.config);
			}
			if (this.config.hidden) {
				return;
			}
		}

		if (this.config.class) {
			container.addClass(...this.config.class.split(' ').filter(x => x !== ''));
		}

		this.renderButton(container);
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
