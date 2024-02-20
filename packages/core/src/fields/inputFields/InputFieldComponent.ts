import { type IPlugin } from 'packages/core/src/IPlugin';
import { type Listener, Notifier } from 'packages/core/src/utils/Signal';
import { type SvelteComponent } from 'svelte';

export class InputFieldComponent<Value> extends Notifier<Value, Listener<Value>> {
	readonly plugin: IPlugin;
	private readonly svelteComponent: typeof SvelteComponent;
	private svelteComponentInstance?: SvelteComponent;
	private mounted: boolean;

	constructor(plugin: IPlugin, svelteComponent: typeof SvelteComponent) {
		super();

		this.plugin = plugin;

		this.mounted = false;
		this.svelteComponent = svelteComponent;
	}

	/**
	 * This sets the value without triggering an update.
	 *
	 * @param value
	 */
	public setValue(value: Value): void {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
	public mount(container: HTMLElement, initialValue: Value, mountArgs: Record<string, unknown> = {}): void {
		const props = Object.assign(
			{
				plugin: this.plugin,
				value: initialValue,
				onValueChange: (value: Value) => {
					// console.log('prop value change');
					this.notifyListeners(value);
				},
			},
			mountArgs,
		);

		this.svelteComponentInstance = new this.svelteComponent({
			target: container,
			props: props,
		});

		this.mounted = true;
	}

	/**
	 * This unmounts the component.
	 */
	public unmount(): void {
		this.unregisterAllListeners();
		this.svelteComponentInstance?.$destroy();

		this.mounted = false;
	}

	public isMounted(): boolean {
		return this.mounted;
	}
}
