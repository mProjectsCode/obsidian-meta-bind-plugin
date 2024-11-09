import { ErrorLevel, MetaBindInternalError } from 'packages/core/src/utils/errors/MetaBindErrors';
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
			try {
				listener.callback(value);
			} catch (e) {
				const error = e instanceof Error ? e : String(e);

				console.error(
					new MetaBindInternalError({
						errorLevel: ErrorLevel.ERROR,
						effect: 'error while calling listener callback',
						cause: error,
					}),
				);
			}
		}
	}
}

export interface Listener<T> {
	uuid: string;
	callback: ListenerCallback<T>;
}

export type ListenerCallback<T> = (value: T) => void;

export type SignalLike<T> = Signal<T> | ComputedSignal<unknown, T> | MappedSignal<unknown, T>;

export interface Writable<T> {
	set(value: T): void;
}

export class Signal<T> extends Notifier<T, Listener<T>> implements Writable<T> {
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
		this.notifyListeners(value);
	}
}

export class MappedSignal<R, T> extends Notifier<T, Listener<T>> implements Writable<R> {
	private value: T;
	private readonly mapFn: (value: R) => T;

	constructor(value: R, mapFn: (value: R) => T) {
		super();
		this.value = mapFn(value);
		this.mapFn = mapFn;
	}

	public get(): T {
		return this.value;
	}

	public set(value: R): void {
		this.value = this.mapFn(value);
		this.notifyListeners(this.value);
	}

	public setDirect(value: T): void {
		this.value = value;
		this.notifyListeners(value);
	}
}

export class ComputedSignal<R, T> extends Notifier<T, Listener<T>> implements Writable<T> {
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
		this.notifyListeners(value);
	}

	public destroy(): void {
		this.dependency.unregisterListener(this.dependencyListener);
	}
}
