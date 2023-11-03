import { type Listener, ListenerCallback, Notifier, Signal } from '../../src/utils/Signal';
import { describe, test, expect, beforeEach, spyOn, Mock } from 'bun:test';
describe('notifier', () => {
	let notifier: Notifier<number, Listener<number>>;
	let listener1: Omit<Listener<number>, 'uuid'>;
	let listener2: Omit<Listener<number>, 'uuid'>;
	let spy1: Mock<ListenerCallback<number>>;
	let spy2: Mock<ListenerCallback<number>>;

	beforeEach(() => {
		notifier = new Notifier();

		listener1 = {
			callback: (_: number): void => {},
		};
		listener2 = {
			callback: (_: number): void => {},
		};

		spy1 = spyOn(listener1, 'callback');
		spy2 = spyOn(listener2, 'callback');
	});

	test('should notify single listener', () => {
		notifier.registerListener(listener1);
		notifier.notifyListeners(9);

		expect(spy1).toHaveBeenCalledTimes(1);
		// expect(spy1).toHaveBeenCalledWith(9);
	});

	test('should notify multiple listeners', () => {
		notifier.registerListener(listener1);
		notifier.registerListener(listener2);
		notifier.notifyListeners(9);

		expect(spy1).toHaveBeenCalledTimes(1);
		// expect(spy1).toHaveBeenCalledWith(9);

		expect(spy2).toHaveBeenCalledTimes(1);
		// expect(spy2).toHaveBeenCalledWith(9);
	});

	test('should not notify unregistered listener', () => {
		notifier.registerListener(listener1);
		const l = notifier.registerListener(listener2);
		notifier.unregisterListener(l);
		notifier.notifyListeners(9);

		expect(spy1).toHaveBeenCalledTimes(1);
		// expect(spy1).toHaveBeenCalledWith(9);

		expect(spy2).toHaveBeenCalledTimes(0);
	});

	test('should notify multiple times', () => {
		notifier.registerListener(listener1);
		notifier.notifyListeners(8);

		notifier.registerListener(listener2);
		notifier.notifyListeners(9);

		expect(spy1).toHaveBeenCalledTimes(2);
		// expect(spy1).toHaveBeenCalledWith(8);
		// expect(spy1).toHaveBeenCalledWith(9);

		expect(spy2).toHaveBeenCalledTimes(1);
		// expect(spy2).toHaveBeenCalledWith(9);
	});
});

describe('signal', () => {
	let signal: Signal<number>;
	let listener1: Omit<Listener<number>, 'uuid'>;
	let listener2: Omit<Listener<number>, 'uuid'>;
	let spy1: Mock<ListenerCallback<number>>;
	let spy2: Mock<ListenerCallback<number>>;

	beforeEach(() => {
		signal = new Signal<number>(0);

		listener1 = {
			callback: (_: number): void => {},
		};
		listener2 = {
			callback: (_: number): void => {},
		};

		spy1 = spyOn(listener1, 'callback');
		spy2 = spyOn(listener2, 'callback');
	});

	test('should get initial value', () => {
		expect(signal.get()).toBe(0);
	});

	test('should notify single listener', () => {
		signal.registerListener(listener1);
		signal.set(9);

		expect(signal.get()).toBe(9);

		expect(spy1).toHaveBeenCalledTimes(1);
		// expect(spy1).toHaveBeenCalledWith(9);

		expect(spy2).toHaveBeenCalledTimes(0);
	});

	test('should notify multiple times', () => {
		signal.registerListener(listener1);
		signal.set(8);

		expect(signal.get()).toBe(8);

		signal.registerListener(listener2);
		signal.set(9);

		expect(signal.get()).toBe(9);

		expect(spy1).toHaveBeenCalledTimes(2);
		// expect(spy1).toHaveBeenCalledWith(8);
		// expect(spy1).toHaveBeenCalledWith(9);

		expect(spy2).toHaveBeenCalledTimes(1);
		// expect(spy2).toHaveBeenCalledWith(9);
	});

	test('should not notify unregistered listeners times', () => {
		const l = signal.registerListener(listener1);
		signal.set(8);

		expect(signal.get()).toBe(8);

		signal.unregisterListener(l);

		signal.registerListener(listener2);
		signal.set(9);

		expect(signal.get()).toBe(9);

		expect(spy1).toHaveBeenCalledTimes(1);
		// expect(spy1).toHaveBeenCalledWith(8);

		expect(spy2).toHaveBeenCalledTimes(1);
		// expect(spy2).toHaveBeenCalledWith(9);
	});
});
