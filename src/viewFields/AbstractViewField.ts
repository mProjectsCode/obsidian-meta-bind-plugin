import { type ViewFieldDeclaration } from '../parsers/viewFieldParser/ViewFieldDeclaration';
import { type ViewFieldMDRC, type ViewFieldVariable } from '../renderChildren/ViewFieldMDRC';
import { ViewFieldArgumentType } from '../parsers/viewFieldParser/ViewFieldConfigs';

export abstract class AbstractViewField {
	protected renderChild: ViewFieldMDRC;
	container?: HTMLElement;

	// hidden argument
	hidden: boolean;

	protected constructor(renderChild: ViewFieldMDRC) {
		this.renderChild = renderChild;
		this.hidden = false;
	}

	abstract buildVariables(declaration: ViewFieldDeclaration): ViewFieldVariable[];

	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	abstract computeValue(variables: ViewFieldVariable[]): unknown | Promise<unknown>;

	abstract getDefaultDisplayValue(): string;

	async render(container: HTMLElement): Promise<void> {
		this.container = container;
		this.container.addClass('mb-view-text');

		this.hidden = this.renderChild.getArgument(ViewFieldArgumentType.HIDDEN)?.value ?? false;

		if (this.hidden) {
			this.container.addClass('mb-view-hidden');
		}

		await this._render(container);

		await this.update(this.getDefaultDisplayValue());
	}

	async update(value: unknown): Promise<void> {
		if (!this.container) {
			return;
		}

		try {
			const text = value?.toString() ?? '';

			if (!this.hidden) {
				this.container.empty();
				await this._update(this.container, text);
			}
			this.container.removeClass('mb-error');
		} catch (e) {
			if (e instanceof Error) {
				this.container.innerText = e.message;
				this.container.addClass('mb-error');
			}
		}
	}

	protected abstract _render(container: HTMLElement): void | Promise<void>;

	protected abstract _update(container: HTMLElement, text: string): void | Promise<void>;

	abstract destroy(): void;
}
