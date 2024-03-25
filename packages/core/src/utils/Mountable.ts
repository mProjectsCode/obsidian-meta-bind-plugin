export abstract class Mountable {
	private mounted: boolean;
	private targetEl: HTMLElement | undefined;
	private readonly onUnmountCbs: (() => void)[];

	constructor() {
		this.mounted = false;
		this.targetEl = undefined;
		this.onUnmountCbs = [];
	}

	/**
	 * Check if the mountable is currently mounted.
	 */
	public isMounted(): boolean {
		return this.mounted;
	}

	/**
	 * Get the element that the mountable is currently mounted to.
	 */
	public getTargetEl(): HTMLElement | undefined {
		return this.targetEl;
	}

	/**
	 * Called when the mountable is mounted to an element.
	 * ALWAYS call super.onMount() in the overriding method.
	 *
	 * @param targetEl
	 * @protected
	 */
	protected abstract onMount(targetEl: HTMLElement): void;

	/**
	 * Called when the mountable is unmounted from an element.
	 * ALWAYS call super.onUnmount() in the overriding method.
	 *
	 * @param targetEl
	 * @protected
	 */
	protected abstract onUnmount(targetEl: HTMLElement): void;

	/**
	 * Mount the mountable to the given element.
	 * Will throw an error if the mountable is already mounted.
	 *
	 * @param targetEl
	 */
	public mount(targetEl: HTMLElement): void {
		if (this.mounted || this.targetEl) {
			throw new Error('Mountable is already mounted');
		}

		this.mounted = true;
		this.targetEl = targetEl;

		this.onMount(targetEl);
	}

	/**
	 * Unmount the mountable from the current element.
	 * Will throw an error if the mountable is not mounted.
	 */
	public unmount(): void {
		if (!this.mounted || !this.targetEl) {
			throw new Error('Mountable is not mounted');
		}

		this.mounted = false;
		this.onUnmount(this.targetEl);

		for (const cb of this.onUnmountCbs) {
			cb();
		}

		this.targetEl = undefined;
	}

	/**
	 * Register a callback that will be called when the mountable is unmounted.
	 *
	 * @param cb
	 */
	public registerUnmountCb(cb: () => void): void {
		this.onUnmountCbs.push(cb);
	}
}
