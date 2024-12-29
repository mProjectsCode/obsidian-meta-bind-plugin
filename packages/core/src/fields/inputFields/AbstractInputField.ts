import { InputFieldArgumentType } from 'packages/core/src/config/FieldConfigs';
import type { InputFieldMountable } from 'packages/core/src/fields/inputFields/InputFieldMountable';
import type { InputFieldSvelteComponent } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
import { InputFieldSvelteWrapper } from 'packages/core/src/fields/inputFields/InputFieldSvelteWrapper';
import type { IPlugin } from 'packages/core/src/IPlugin';
import type { MetadataSubscription } from 'packages/core/src/metadata/MetadataSubscription';
import { Mountable } from 'packages/core/src/utils/Mountable';
import { MappedSignal } from 'packages/core/src/utils/Signal';

export abstract class AbstractInputField<
	MetadataValueType,
	ComponentValueType,
	SvelteExports = object,
> extends Mountable {
	readonly plugin: IPlugin;
	readonly mountable: InputFieldMountable;
	readonly svelteWrapper: InputFieldSvelteWrapper<ComponentValueType, SvelteExports>;
	readonly inputSignal: MappedSignal<unknown, MetadataValueType>;

	private metadataSubscription?: MetadataSubscription;
	private mountTarget?: HTMLElement;

	constructor(mountable: InputFieldMountable) {
		super();

		this.mountable = mountable;
		this.plugin = mountable.plugin;
		this.svelteWrapper = new InputFieldSvelteWrapper<ComponentValueType, SvelteExports>(
			this.plugin,
			this.getSvelteComponent(),
			value => {
				const mappedValue = this.mapValue(value);
				this.updateDataAttributes(value, mappedValue);
				this.notifySubscription(mappedValue);
			},
		);

		this.inputSignal = new MappedSignal<unknown, MetadataValueType>(
			undefined,
			(value: unknown): MetadataValueType => {
				const filteredValue = this.filterValue(value);
				if (filteredValue !== undefined) {
					return filteredValue;
				} else {
					return this.getDefaultValue();
				}
			},
		);
	}

	protected abstract getSvelteComponent(): InputFieldSvelteComponent<ComponentValueType, SvelteExports>;

	/**
	 * Takes in any value and returns the value if it is type of `T`, `undefined` otherwise.
	 *
	 * @param value
	 */
	protected abstract filterValue(value: unknown): MetadataValueType | undefined;

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
		return this.inputSignal.get();
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
		this.inputSignal.setDirect(value);
		this.notifySubscription(value);
	}

	/**
	 * Set the value of this input field as if the user updated the field.
	 *
	 * @param value
	 */
	public setInternalValue(value: ComponentValueType): void {
		this.setValue(this.mapValue(value));
	}

	private notifySubscription(value: MetadataValueType): void {
		this.metadataSubscription?.write(value);
	}

	public getDefaultValue(): MetadataValueType {
		const defaultValueArgument = this.mountable.getArgument(InputFieldArgumentType.DEFAULT_VALUE);
		if (defaultValueArgument === undefined) {
			return this.mapValue(this.getFallbackDefaultValue());
		}
		const filteredValue = this.filterValue(defaultValueArgument.value);
		if (filteredValue !== undefined) {
			return filteredValue;
		} else {
			return this.mapValue(this.getFallbackDefaultValue());
		}
	}

	private updateDataAttributes(internalValue: ComponentValueType, metadataValue: MetadataValueType): void {
		if (this.mountTarget) {
			this.mountTarget.dataset.internalValue = JSON.stringify(internalValue);
			this.mountTarget.dataset.metadataValue = JSON.stringify(metadataValue);
		}
	}

	protected getMountArgs(): Record<string, unknown> {
		return {};
	}

	protected onMount(targetEl: HTMLElement): void {
		this.mountTarget = targetEl;

		// listener to update the svelte component
		this.inputSignal.registerListener({
			callback: value => this.svelteWrapper.setValue(this.reverseMapValue(value)),
		});

		// listener to update data attributes on the target element
		this.inputSignal.registerListener({
			callback: value => {
				this.updateDataAttributes(this.reverseMapValue(value), value);
			},
		});

		const bindTarget = this.mountable.getBindTarget();

		if (bindTarget) {
			this.metadataSubscription = this.mountable.plugin.metadataManager.subscribe(
				this.mountable.getUuid(),
				this.inputSignal,
				bindTarget,
				() => this.mountable.unmount(),
			);
		}

		this.svelteWrapper.mount(targetEl, this.reverseMapValue(this.getValue()), this.getMountArgs());
	}

	protected onUnmount(): void {
		this.mountTarget = undefined;

		this.inputSignal.unregisterAllListeners();
		this.metadataSubscription?.unsubscribe();

		this.svelteWrapper.unmount();
	}
}
