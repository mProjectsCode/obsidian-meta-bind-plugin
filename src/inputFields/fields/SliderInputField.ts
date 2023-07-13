import { AbstractInputField } from '../AbstractInputField';
import { SliderComponent } from 'obsidian';
import { InputFieldArgumentType } from '../../parsers/InputFieldDeclarationParser';
import { ErrorLevel, MetaBindInternalError } from '../../utils/errors/MetaBindErrors';
import { InputFieldMDRC } from '../../renderChildren/InputFieldMDRC';
import { clamp, MBExtendedLiteral } from '../../utils/Utils';

type T = number;

export class SliderInputField extends AbstractInputField<T> {
	sliderComponent: SliderComponent | undefined;
	minValue: number;
	maxValue: number;

	constructor(inputFieldMDRC: InputFieldMDRC) {
		super(inputFieldMDRC);
		this.minValue = inputFieldMDRC.getArgument(InputFieldArgumentType.MIN_VALUE)?.value ?? 0;
		this.maxValue = inputFieldMDRC.getArgument(InputFieldArgumentType.MAX_VALUE)?.value ?? 100;
	}

	getValue(): T | undefined {
		if (!this.sliderComponent) {
			return undefined;
		}

		return this.sliderComponent.getValue();
	}

	filterValue(value: MBExtendedLiteral | undefined): T | undefined {
		if (typeof value === 'number') {
			return value;
		} else if (typeof value === 'string') {
			const v = Number.parseFloat(value);
			if (Number.isNaN(v)) {
				return undefined;
			} else {
				return clamp(v, this.minValue, this.maxValue);
			}
		} else {
			return undefined;
		}
	}

	updateDisplayValue(value: T): void {
		this.sliderComponent?.setValue(value);
	}

	getFallbackDefaultValue(): T {
		return this.minValue;
	}

	getHtmlElement(): HTMLElement {
		if (!this.sliderComponent) {
			throw new MetaBindInternalError(ErrorLevel.WARNING, 'failed to get html element for input field', "container is undefined, field hasn't been rendered yet");
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
		component.setValue(this.getInitialValue());
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
