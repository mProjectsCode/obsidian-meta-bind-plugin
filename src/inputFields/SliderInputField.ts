import {AbstractInputField} from './AbstractInputField';
import {SliderComponent} from 'obsidian';
import {Logger} from '../utils/Logger';

export class SliderInputField extends AbstractInputField {
	sliderComponent: SliderComponent;
	minValue: number = 0;
	maxValue: number = 100;

	getValue(): any {
		return this.sliderComponent.getValue();
	}

	setValue(value: any): void {
		if (value != null && typeof value == 'number') {
			this.sliderComponent.setValue(value);
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
			container.createSpan({text: this.minValue.toString()});
		}

		const component = new SliderComponent(container);
		component.setValue(this.inputFieldMarkdownRenderChild.getInitialValue());
		component.onChange(this.onValueChange);
		component.setDynamicTooltip();
		component.setLimits(this.minValue, this.maxValue, 1);

		if (labelArgument && labelArgument.value === true) {
			container.createSpan({text: this.maxValue.toString()});
		}

		this.sliderComponent = component;
	}

}
