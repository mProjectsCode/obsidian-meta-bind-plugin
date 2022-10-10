import {AbstractInputField} from './AbstractInputField';
import {SliderComponent} from 'obsidian';
import {Logger} from '../utils/Logger';
import {InputFieldMarkdownRenderChild} from '../InputFieldMarkdownRenderChild';
import {MetaBindInternalError} from '../utils/Utils';
import {InputFieldArgumentType} from '../parsers/InputFieldDeclarationParser';

export class SliderInputField extends AbstractInputField {
	sliderComponent: SliderComponent | undefined;
	minValue: number;
	maxValue: number;


	constructor(inputFieldMarkdownRenderChild: InputFieldMarkdownRenderChild, onValueChange: (value: any) => (void | Promise<void>)) {
		super(inputFieldMarkdownRenderChild, onValueChange);
		this.minValue = inputFieldMarkdownRenderChild.getArgument(InputFieldArgumentType.MIN_VALUE)?.value ?? 0;
		this.maxValue = inputFieldMarkdownRenderChild.getArgument(InputFieldArgumentType.MAX_VALUE)?.value ?? 100;
	}

	getValue(): any {
		if (!this.sliderComponent) {
			throw new MetaBindInternalError('slider input component is undefined');
		}

		return this.sliderComponent.getValue();
	}

	setValue(value: any): void {
		if (!this.sliderComponent) {
			throw new MetaBindInternalError('slider input component is undefined');
		}

		if (value != null && typeof value == 'number') {
			if (value >= this.minValue && value <= this.maxValue) {
				this.sliderComponent.setValue(value);
			}
		} else {
			Logger.logWarning(`can not set value of slider to \'${value}\'`);
			this.sliderComponent.setValue(this.getDefaultValue());
		}
	}

	isEqualValue(value: any): boolean {
		return this.getValue() == value;
	}

	getDefaultValue(): any {
		return this.minValue;
	}

	getHtmlElement(): HTMLElement {
		if (!this.sliderComponent) {
			throw new MetaBindInternalError('slider input component is undefined');
		}

		return this.sliderComponent.sliderEl;
	}

	render(container: HTMLDivElement): void {
		container.removeClass('meta-bind-plugin-input-wrapper');
		container.addClass('meta-bind-plugin-flex-input-wrapper');

		const labelArgument = this.inputFieldMarkdownRenderChild.getArgument(InputFieldArgumentType.ADD_LABELS);
		if (labelArgument && labelArgument.value === true) {
			container.createSpan({text: this.minValue.toString(), cls: 'meta-bind-plugin-slider-input-label'});
		}

		const component = new SliderComponent(container);
		component.setValue(this.inputFieldMarkdownRenderChild.getInitialValue());
		component.onChange(this.onValueChange);
		component.setDynamicTooltip();
		component.setLimits(this.minValue, this.maxValue, 1);
		component.sliderEl.addClass('meta-bind-plugin-slider-input');

		if (labelArgument && labelArgument.value === true) {
			container.createSpan({text: this.maxValue.toString(), cls: 'meta-bind-plugin-slider-input-label'});
		}

		this.sliderComponent = component;
	}

}
