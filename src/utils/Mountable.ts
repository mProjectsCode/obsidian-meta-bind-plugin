export abstract class Mountable {
	private mounted: boolean;
	private targetEl: HTMLElement | undefined;

	protected constructor() {
		this.mounted = false;
	}

	public isMounted(): boolean {
		return this.mounted;
	}

	public getTargetEl(): HTMLElement | undefined {
		return this.targetEl;
	}

	protected abstract onMount(targetEl: HTMLElement): void;

	protected abstract onUnmount(targetEl: HTMLElement): void;

	public mount(targetEl: HTMLElement): void {
		if (this.mounted || this.targetEl) {
			throw new Error('Mountable is already mounted');
		}

		this.mounted = true;
		this.targetEl = targetEl;

		this.onMount(targetEl);
	}

	public unmount(): void {
		if (!this.mounted || !this.targetEl) {
			throw new Error('Mountable is not mounted');
		}

		this.mounted = false;
		this.onUnmount(this.targetEl);

		this.targetEl = undefined;
	}
}
