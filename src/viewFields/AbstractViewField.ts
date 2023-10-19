import { ViewFieldDeclaration } from '../parsers/viewFieldParser/ViewFieldDeclaration';
import { ViewFieldMDRC, ViewFieldVariable } from '../renderChildren/ViewFieldMDRC';
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

	abstract computeValue(variables: ViewFieldVariable[]): any | Promise<any>;

	abstract getDefaultDisplayValue(): string;

	async render(container: HTMLElement): Promise<void> {
		this.container = container;
		this.container.addClass('mb-view-text');

		this.hidden = this.renderChild.getArgument(ViewFieldArgumentType.HIDDEN)?.value ?? false;

		if (this.hidden) {
			this.container.addClass('mb-view-hidden');
		}

		this._render(container);

		return await this.update(this.getDefaultDisplayValue());
	}

	async update(value: any): Promise<void> {
		if (!this.container) {
			return;
		}

		try {
			const text = value?.toString() ?? '';

			if (!this.hidden) {
				this.container.empty();
				this._update(this.container, text);
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
