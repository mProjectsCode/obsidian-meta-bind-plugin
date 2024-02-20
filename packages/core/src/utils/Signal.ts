import { getUUID } from 'packages/core/src/utils/Utils';

export interface NotifierInterface<T, TListener extends Listener<T>> {
	registerListener(listener: Omit<TListener, 'uuid'>): TListener;

	unregisterListener(listener: TListener): void;

	unregisterListenerById(listenerId: string): void;

	notifyListeners(value: T): void;
}

export class Notifier<T, TListener extends Listener<T>> implements NotifierInterface<T, TListener> {
	private listeners: TListener[];

	constructor() {
		this.listeners = [];
	}

	public registerListener(listener: Omit<TListener, 'uuid'>): TListener {
		const l: TListener = listener as TListener;
		l.uuid = getUUID();

		this.listeners.push(l);

		return l;
	}

	public unregisterListener(listener: TListener): void {
		this.unregisterListenerById(listener.uuid);
	}

	public unregisterListenerById(listenerId: string): void {
		this.listeners = this.listeners.filter(x => x.uuid !== listenerId);
	}

	public unregisterAllListeners(): void {
		this.listeners = [];
	}

	public notifyListeners(value: T): void {
		for (const listener of this.listeners) {
			// console.debug('meta-bind | calling listener callback', value);
			listener.callback(value);
		}
	}
}

export interface Listener<T> {
	uuid: string;
	callback: ListenerCallback<T>;
}

export type ListenerCallback<T> = (value: T) => void;

export type SignalLike<T> = Signal<T> | ComputedSignal<unknown, T>;

export class Signal<T> extends Notifier<T, Listener<T>> {
	private value: T;

	constructor(value: T) {
		super();
		this.value = value;
	}

	public get(): T {
		return this.value;
	}

	public set(value: T): void {
		this.value = value;
		// console.debug('meta-bind | setting signal to', value);
		this.notifyListeners(value);
	}
}

export class ComputedSignal<R, T> extends Notifier<T, Listener<T>> {
	private value: T;
	private readonly dependency: SignalLike<R>;
	private readonly dependencyListener: Listener<R>;

	constructor(dependency: SignalLike<R>, compute: (signal: R) => T) {
		super();
		this.dependency = dependency;

		this.value = compute(dependency.get());

		this.dependencyListener = dependency.registerListener({ callback: (value: R) => this.set(compute(value)) });
	}

	public get(): T {
		return this.value;
	}

	public set(value: T): void {
		this.value = value;
		// console.debug('meta-bind | setting signal to', value);
		this.notifyListeners(value);
	}

	public destroy(): void {
		this.dependency.unregisterListener(this.dependencyListener);
	}
}
