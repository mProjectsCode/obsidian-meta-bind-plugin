import { SvelteComponent } from 'svelte';
import { Listener, Notifier } from '../../utils/Signal';

export class InputFieldComponent<Value> extends Notifier<Value, Listener<Value>> {
	private readonly svelteComponent: typeof SvelteComponent;
	private svelteComponentInstance?: SvelteComponent;

	constructor(svelteComponent: typeof SvelteComponent) {
		super();

		this.svelteComponent = svelteComponent;
	}

	/**
	 * This sets the value without triggering an update.
	 *
	 * @param value
	 */
	public setValue(value: Value): void {
		this.svelteComponentInstance?.setValue(value);
	}

	/**
	 * This mounts the component to the container element.
	 * Don't forget to call unmount.
	 *
	 * @param container
	 * @param initialValue
	 * @param mountArgs
	 */
	public mount(container: HTMLElement, initialValue: Value, mountArgs: Record<string, any> = {}): void {
		const props = Object.assign(
			{
				value: initialValue,
				onValueChange: (value: Value) => {
					console.log('prop value change');
					this.notifyListeners(value);
				},
			},
			mountArgs
		);

		this.svelteComponentInstance = new this.svelteComponent({
			target: container,
			props: props,
		});
	}

	/**
	 * This unmounts the component.
	 */
	public unmount(): void {
		this.listeners = [];
		this.svelteComponentInstance?.$destroy();
	}
}
