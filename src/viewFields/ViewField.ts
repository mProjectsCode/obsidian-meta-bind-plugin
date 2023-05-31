import {ViewFieldMarkdownRenderChild} from '../ViewFieldMarkdownRenderChild';

export class ViewField {
	viewFieldMarkdownRenderChild: ViewFieldMarkdownRenderChild;
	container?: HTMLDivElement;

	constructor(viewFieldMarkdownRenderChild: ViewFieldMarkdownRenderChild) {
		this.viewFieldMarkdownRenderChild = viewFieldMarkdownRenderChild;
	}

	render(container: HTMLDivElement) {
		this.container = container;
		this.update();
	}

	update() {
		if (!this.container) {
			return;
		}

		try {
			this.container.innerText = this.viewFieldMarkdownRenderChild.evaluateExpression();
			this.container.removeClass("meta-bind-plugin-error");
		} catch (e) {
			if (e instanceof Error) {
				this.container.innerText = e.message;
				this.container.addClass("meta-bind-plugin-error");
			}
		}
	}
}
