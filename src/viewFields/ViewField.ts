import { AbstractViewFieldMDRC } from '../renderChildren/AbstractViewFieldMDRC';

export class ViewField {
	viewFieldMDRC: AbstractViewFieldMDRC;
	container?: HTMLDivElement;

	constructor(viewFieldMDRC: AbstractViewFieldMDRC) {
		this.viewFieldMDRC = viewFieldMDRC;
	}

	render(container: HTMLDivElement) {
		this.container = container;
		this.update();
	}

	async update() {
		if (!this.container) {
			return;
		}

		try {
			this.container.innerText = await this.viewFieldMDRC.evaluateExpression();
			this.container.removeClass('meta-bind-plugin-error');
		} catch (e) {
			if (e instanceof Error) {
				this.container.innerText = e.message;
				this.container.addClass('meta-bind-plugin-error');
			}
		}
	}
}
