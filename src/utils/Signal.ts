import * as crypto from 'crypto';

export interface NotifierInterface<T, L extends Listener<T>> {
	registerListener(listener: Omit<L, 'uuid'>): L;

	unregisterListener(listener: L): void;

	unregisterListenerById(listenerId: string): void;

	notifyListeners(value: T): void;
}

export class Notifier<T, L extends Listener<T>> implements NotifierInterface<T, Listener<T>> {
	listeners: L[];

	constructor() {
		this.listeners = [];
	}

	public registerListener(listener: Omit<L, 'uuid'>): L {
		const l: L = listener as L;
		l.uuid = crypto.randomUUID();

		this.listeners.push(l);

		return l;
	}

	public unregisterListener(listener: L): void {
		this.unregisterListenerById(listener.uuid);
	}

	public unregisterListenerById(listenerId: string): void {
		this.listeners = this.listeners.filter(x => x.uuid !== listenerId);
	}

	public notifyListeners(value: T): void {
		for (const listener of this.listeners) {
			listener.callback(value);
		}
	}
}

export interface Listener<T> {
	uuid: string;
	callback: ListenerCallback<T>;
}

export type ListenerCallback<T> = (value: T) => void;

export class Signal<T> extends Notifier<T, Listener<T>> {
	value: T;

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
