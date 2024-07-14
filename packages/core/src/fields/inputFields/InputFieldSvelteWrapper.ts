import type { IPlugin } from 'packages/core/src/IPlugin';
import { type Listener, Notifier } from 'packages/core/src/utils/Signal';
import { mount, type Component as SvelteComponent, unmount } from 'svelte';

export type InputFieldSvelteComponent<Value, Exports = object> = SvelteComponent<
	{
		plugin: IPlugin;
		value: Value;
		onValueChange: (value: Value) => void;
	},
	{
		setValue: (value: Value) => void;
	} & Exports
>;

export interface InputFieldSvelteProps<Value> {
	plugin: IPlugin;
	value: Value;
	onValueChange: (value: Value) => void;
}

export class InputFieldSvelteWrapper<Value, SvelteExports = object> extends Notifier<Value, Listener<Value>> {
	readonly plugin: IPlugin;
	private readonly svelteComponent: InputFieldSvelteComponent<Value, SvelteExports>;
	private svelteComponentInstance?: ReturnType<InputFieldSvelteComponent<Value, SvelteExports>>;
	private mounted: boolean;

	constructor(plugin: IPlugin, svelteComponent: InputFieldSvelteComponent<Value, SvelteExports>) {
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

	public getInstance(): ReturnType<InputFieldSvelteComponent<Value, SvelteExports>> | undefined {
		return this.svelteComponentInstance;
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

		this.svelteComponentInstance = mount(this.svelteComponent, {
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
		if (this.svelteComponentInstance) {
			unmount(this.svelteComponentInstance);
		}

		this.mounted = false;
	}

	public isMounted(): boolean {
		return this.mounted;
	}
}
