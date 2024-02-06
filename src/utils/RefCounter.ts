export class RefCounter<T> {
	private readonly value: T;
	private count: number;

	constructor(value: T) {
		this.value = value;
		this.count = 1;
	}

	getValue(): T {
		return this.value;
	}

	increment(): number {
		this.count += 1;
		return this.count;
	}

	decrement(): number {
		this.count -= 1;
		return this.count;
	}

	getCount(): number {
		return this.count;
	}

	isEmpty(): boolean {
		return this.count === 0;
	}
}
