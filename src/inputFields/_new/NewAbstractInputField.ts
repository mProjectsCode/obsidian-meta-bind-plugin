import { InputFieldMDRC } from '../../renderChildren/InputFieldMDRC';
import { InputFieldComponent } from './InputFieldComponent';
import { SvelteComponent } from 'svelte';
import { ComputedSignal, Listener, Notifier } from '../../utils/Signal';
import { InputFieldArgumentType } from '../InputFieldConfigs';
import { DefaultValueInputFieldArgument } from '../../inputFieldArguments/arguments/DefaultValueInputFieldArgument';

export abstract class NewAbstractInputField<MetadataValueType, ComponentValueType> extends Notifier<MetadataValueType, Listener<MetadataValueType>> {
	readonly renderChild: InputFieldMDRC;
	readonly inputFieldComponent: InputFieldComponent<ComponentValueType>;
	readonly signal: ComputedSignal<any, MetadataValueType>;

	protected constructor(renderChild: InputFieldMDRC) {
		super();

		this.renderChild = renderChild;
		this.inputFieldComponent = new InputFieldComponent<ComponentValueType>(this.getSvelteComponent());

		this.signal = new ComputedSignal<any, MetadataValueType>(this.renderChild.writeSignal, (value: any): MetadataValueType => {
			const filteredValue = this.filterValue(value);
			return filteredValue !== undefined ? filteredValue : this.getDefaultValue();
		});

		this.signal.registerListener({
			callback: value => this.inputFieldComponent.setValue(this.reverseMapValue(value)),
		});

		this.inputFieldComponent.registerListener({
			callback: value => {
				console.log('input field component change', value);
				this.notifyListeners(this.mapValue(value));
			},
		});
	}

	protected abstract getSvelteComponent(): typeof SvelteComponent;

	/**
	 * Takes in any value and returns the value if it is type of `T`, `undefined` otherwise.
	 *
	 * @param value
	 */
	protected abstract filterValue(value: any): MetadataValueType | undefined;

	protected abstract getFallbackDefaultValue(): ComponentValueType;

	/**
	 * Maps a metadata value to a component value. If the value can't be mapped, the function should return `undefined`.
	 *
	 * @param value
	 */
	protected abstract rawReverseMapValue(value: MetadataValueType): ComponentValueType | undefined;
	protected abstract rawMapValue(value: ComponentValueType): MetadataValueType;

	private reverseMapValue(value: MetadataValueType): ComponentValueType {
		const mappedValue = this.rawReverseMapValue(value);
		if (mappedValue !== undefined) {
			return mappedValue;
		}
		const mappedDefaultValue = this.rawReverseMapValue(this.getDefaultValue());
		if (mappedDefaultValue !== undefined) {
			return mappedDefaultValue;
		}
		return this.getFallbackDefaultValue();
	}

	private mapValue(value: ComponentValueType): MetadataValueType {
		return this.rawMapValue(value);
	}

	/**
	 * Get the metadata value that the input field currently has.
	 */
	public getValue(): MetadataValueType {
		return this.signal.get();
	}

	/**
	 * Get the internal representation of the metadata value that the input field currently has.
	 */
	public getInternalValue(): ComponentValueType {
		return this.reverseMapValue(this.getValue());
	}

	/**
	 * Set the value of this input field as if the user updated the field.
	 *
	 * @param value
	 */
	public setValue(value: MetadataValueType): void {
		this.signal.set(value);
		this.notifyListeners(value);
	}

	/**
	 * Set the value of this input field as if the user updated the field.
	 *
	 * @param value
	 */
	public setInternalValue(value: ComponentValueType): void {
		this.setValue(this.mapValue(value));
	}

	private getDefaultValue(): MetadataValueType {
		const defaultValueArgument = this.renderChild.getArgument(InputFieldArgumentType.DEFAULT_VALUE) as DefaultValueInputFieldArgument | undefined;
		if (!defaultValueArgument) {
			return this.mapValue(this.getFallbackDefaultValue());
		}
		const filteredValue = this.filterValue(defaultValueArgument.value);
		return filteredValue !== undefined ? filteredValue : this.mapValue(this.getFallbackDefaultValue());
	}

	protected getMountArgs(): Record<string, any> {
		return {};
	}

	public mount(container: HTMLElement): void {
		this.inputFieldComponent.mount(container, this.reverseMapValue(this.getValue()), this.getMountArgs());
	}

	public unmount(): void {
		this.inputFieldComponent.unmount();
	}
}
