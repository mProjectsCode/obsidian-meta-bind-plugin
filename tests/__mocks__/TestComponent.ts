export class TestComponent {
	loaded: boolean;
	used: boolean;
	callbacks: (() => void)[];

	constructor() {
		this.loaded = false;
		this.used = false;
		this.callbacks = [];
	}

	load() {
		if (this.loaded) {
			throw new Error('Attempted double load of TestComponent');
		}
		if (this.used) {
			throw new Error('Attempted reuse of TestComponent');
		}
		this.loaded = true;
	}

	unload() {
		if (!this.loaded && !this.used) {
			throw new Error('Attempted unload of TestComponent before it was loaded');
		}
		if (!this.loaded && this.used) {
			throw new Error('Attempted double unload of TestComponent');
		}
		this.loaded = false;
		this.used = true;
		this.callbacks.forEach(cb => cb());
	}

	register(callback: () => void) {
		if (this.used) {
			throw new Error(
				'Attempted to register callback after TestComponent was used. The callback will never be called.',
			);
		}

		this.callbacks.push(callback);
	}
}
