import { AbstractInputField } from './AbstractInputField';
import { SliderComponent } from 'obsidian';
import { InputFieldArgumentType } from '../parsers/InputFieldDeclarationParser';
import { MetaBindInternalError, MetaBindValueError } from '../utils/MetaBindErrors';
import { InputFieldMDRC } from '../renderChildren/InputFieldMDRC';

export class SliderInputField extends AbstractInputField {
	sliderComponent: SliderComponent | undefined;
	minValue: number;
	maxValue: number;

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);
		this.minValue = inputFieldMDRC.getArgument(InputFieldArgumentType.MIN_VALUE)?.value ?? 0;
		this.maxValue = inputFieldMDRC.getArgument(InputFieldArgumentType.MAX_VALUE)?.value ?? 100;
	}

	getValue(): number | undefined {
		if (!this.sliderComponent) {
			return undefined;
		}

		return this.sliderComponent.getValue();
	}

	setValue(value: any): void {
		if (!this.sliderComponent) {
			return;
		}

		if (value != null && typeof value == 'number') {
			if (value >= this.minValue && value <= this.maxValue) {
				this.sliderComponent.setValue(value);
			}
		} else {
			console.warn(new MetaBindValueError(`invalid value '${value}' at sliderInputField ${this.renderChild.uuid}`));
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
		console.debug(`meta-bind | SliderInputField >> render ${this.renderChild.uuid}`);

		container.removeClass('meta-bind-plugin-input-wrapper');
		container.addClass('meta-bind-plugin-flex-input-wrapper');

		const labelArgument = this.renderChild.getArgument(InputFieldArgumentType.ADD_LABELS);
		if (labelArgument && labelArgument.value === true) {
			container.createSpan({ text: this.minValue.toString(), cls: 'meta-bind-plugin-slider-input-label' });
		}

		const component = new SliderComponent(container);
		component.setLimits(this.minValue, this.maxValue, 1);
		component.setValue(this.renderChild.getInitialValue());
		component.onChange(this.onValueChange);
		component.setDynamicTooltip();
		component.sliderEl.addClass('meta-bind-plugin-slider-input');

		if (labelArgument && labelArgument.value === true) {
			container.createSpan({ text: this.maxValue.toString(), cls: 'meta-bind-plugin-slider-input-label' });
		}

		this.sliderComponent = component;
	}

	public destroy(): void {}
}
