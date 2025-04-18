import type { MetaBind } from 'packages/core/src';
import type { Component as SvelteComponent } from 'svelte';
import { mount, unmount } from 'svelte';

export type InputFieldSvelteComponent<Value, Exports = object> = SvelteComponent<
	InputFieldSvelteProps<Value>,
	{
		setValue: (value: Value) => void;
	} & Exports
>;

export interface InputFieldSvelteProps<Value> {
	mb: MetaBind;
	value: Value;
	onValueChange: (value: Value) => void;
}

export class InputFieldSvelteWrapper<Value, SvelteExports = object> {
	readonly mb: MetaBind;
	private readonly svelteComponent: InputFieldSvelteComponent<Value, SvelteExports>;
	private svelteComponentInstance?: ReturnType<InputFieldSvelteComponent<Value, SvelteExports>>;
	private mounted: boolean;
	private onValueChange: (value: Value) => void;

	constructor(
		mb: MetaBind,
		svelteComponent: InputFieldSvelteComponent<Value, SvelteExports>,
		onValueChange: (value: Value) => void,
	) {
		this.mb = mb;

		this.mounted = false;
		this.svelteComponent = svelteComponent;
		this.onValueChange = onValueChange;
	}

	/**
	 * This sets the value without triggering an update.
	 *
	 * @param value
	 */
	public setValue(value: Value): void {
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
				mb: this.mb,
				value: initialValue,
				onValueChange: this.onValueChange,
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
		if (this.svelteComponentInstance) {
			void unmount(this.svelteComponentInstance);
		}

		this.mounted = false;
	}

	public isMounted(): boolean {
		return this.mounted;
	}
}
