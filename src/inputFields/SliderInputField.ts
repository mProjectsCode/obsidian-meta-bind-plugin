import {AbstractInputField} from './AbstractInputField';
import {SliderComponent} from 'obsidian';
import {Logger} from '../utils/Logger';
import {InputFieldMarkdownRenderChild} from '../InputFieldMarkdownRenderChild';

export class SliderInputField extends AbstractInputField {
	sliderComponent: SliderComponent;
	minValue: number;
	maxValue: number;


	constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild, onValueChange: (value: any) => (void | Promise<void>)) {
		super(inputFieldMarkdownRenderChild, onValueChange);
		this.minValue = inputFieldMarkdownRenderChild.getArgument('minValue')?.value ?? 0;
		this.maxValue = inputFieldMarkdownRenderChild.getArgument('maxValue')?.value ?? 100;
	}

	getValue(): any {
		return this.sliderComponent.getValue();
	}

	setValue(value: any): void {
		if (value != null && typeof value == 'number') {
			if (value >= this.minValue && value <= this.maxValue) {
				this.sliderComponent.setValue(value);
			}
		} else {
			Logger.logWarning(`can not set value of slider to \'${value}\'`);
			this.sliderComponent.setValue(this.minValue);
		}
	}

	getHtmlElement(): HTMLElement {
		return this.sliderComponent.sliderEl;
	}

	render(container: HTMLDivElement): void {
		let labelArgument = this.inputFieldMarkdownRenderChild.getArgument('labels');
		if (labelArgument && labelArgument.value === true) {
			container.createSpan({text: this.minValue.toString(), cls: 'meta-bind-slider-label'});
		}

		const component = new SliderComponent(container);
		component.setValue(this.inputFieldMarkdownRenderChild.getInitialValue());
		component.onChange(this.onValueChange);
		component.setDynamicTooltip();
		component.setLimits(this.minValue, this.maxValue, 1);

		if (labelArgument && labelArgument.value === true) {
			container.createSpan({text: this.maxValue.toString(), cls: 'meta-bind-slider-label'});
		}

		this.sliderComponent = component;
	}

}
