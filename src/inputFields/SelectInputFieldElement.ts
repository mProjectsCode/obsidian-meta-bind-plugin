import {SelectInputField} from './SelectInputField';

export class SelectInputFieldElement {
	value: string;
	selectInputField: SelectInputField;
	readonly id: number;
	element: HTMLDivElement;

	cssClass: string;
	activeClass: string;
	hoverClass: string;

	private active: boolean;
	private highlighted: boolean;

	constructor(value: string, parentElement: HTMLElement, id: number, multiSelectInputField: SelectInputField, active: boolean = false) {
		this.value = value;
		this.id = id;
		this.active = active;
		this.selectInputField = multiSelectInputField;

		this.cssClass = 'meta-bind-plugin-select-element';
		this.activeClass = 'meta-bind-plugin-select-element-selected';
		this.hoverClass = 'meta-bind-plugin-select-element-hover';

		this.element = parentElement.createDiv({cls: this.cssClass});
		this.element.id = this.getHTMLId();
		this.element.on('click', '#' + this.getHTMLId(), () => {
			this.setActive(!this.active);
			if (!this.selectInputField.allowMultiSelect) {
				this.selectInputField.disableAllOtherElements(this.id);
			}
		});
		this.element.on('mouseenter', '#' + this.getHTMLId(), () => {
			this.setHighlighted(true);
		});
		this.element.on('mouseleave', '#' + this.getHTMLId(), () => {
			this.setHighlighted(false);
		});
	}

	getHTMLId(): string {
		return `meta-bind-select-element-${this.selectInputField.inputFieldMarkdownRenderChild.uid}-${this.id}`;
	}

	isHighlighted(): boolean {
		return this.highlighted;
	}

	setHighlighted(value: boolean) {
		this.highlighted = value;
		if (this.highlighted) {
			this.addClass(this.hoverClass);
			this.selectInputField.deHighlightAllOtherElements(this.id);
		} else {
			this.removeClass(this.hoverClass);
		}
	}

	isActive(): boolean {
		return this.active;
	}

	setActive(active: boolean, updateParent: boolean = true): void {
		this.active = active;
		this.update(updateParent);
	}

	update(updateParent: boolean): void {
		if (this.active) {
			this.addClass(this.activeClass);
		} else {
			this.removeClass(this.activeClass);
		}
		if (updateParent) {
			this.selectInputField.onChange();
		}
	}

	addClass(cssClass: string): void {
		if (!this.element.hasClass(cssClass)) {
			this.element.addClass(cssClass);
		}
	}

	removeClass(cssClass: string): void {
		if (this.element.hasClass(cssClass)) {
			this.element.removeClass(cssClass);
		}
	}

	render() {
		this.element.createEl('div', {text: this.value});
	}
}
