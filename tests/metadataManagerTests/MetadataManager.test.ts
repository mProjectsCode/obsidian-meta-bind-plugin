import { MetadataManager } from '../../src/metadata/MetadataManager';
import { MetadataSubscription } from '../../src/metadata/MetadataSubscription';
import { getUUID } from '../../src/utils/Utils';
import { ListenerCallback, Signal } from '../../src/utils/Signal';
import { TestMetadataAdapter } from '../mocks/TestMetadataAdapter';
import { beforeEach, describe, expect, Mock, spyOn, test } from 'bun:test';
import { parsePropPath } from '../../src/utils/prop/PropParser';
import { BindTargetDeclaration, BindTargetStorageType } from '../../src/parsers/BindTargetDeclaration';

const testFilePath = 'testFile';

function subscribe(
	manager: MetadataManager,
	bindTarget: BindTargetDeclaration,
): { subscription: MetadataSubscription; signal: Signal<unknown>; spy: Mock<ListenerCallback<unknown>> } {
	const signal = new Signal<unknown>(undefined);
	const spy = spyOn(signal, 'set');
	const subscription = manager.subscribe(getUUID(), signal, bindTarget, () => {});
	return {
		subscription: subscription,
		signal: signal,
		spy: spy,
	};
}

function createBindTarget(file: string, path: string[], listenToChildren: boolean = false): BindTargetDeclaration {
	return {
		storageType: BindTargetStorageType.FRONTMATTER,
		storagePath: file,
		storageProp: parsePropPath(path),
		listenToChildren: listenToChildren,
	};
}

describe('metadata manager', () => {
	let manager: MetadataManager;

	beforeEach(() => {
		const adapter = new TestMetadataAdapter(new Map());
		manager = new MetadataManager(adapter);
	});

	test('subscribing should change the signal value to the current cache value', () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));

		expect(s1.signal.get()).toBe(undefined);
		expect(s1.spy).toHaveBeenCalledTimes(1);
		expect(s1.spy.mock.calls).toEqual([[undefined]]);
	});

	test('unsubscribing should not change the signal value', () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));
		s1.subscription.unsubscribe();

		expect(s1.signal.get()).toBe(undefined);
		expect(s1.spy).toHaveBeenCalledTimes(1);
		expect(s1.spy.mock.calls).toEqual([[undefined]]);
	});

	test('should update on external update', () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));

		expect(s1.signal.get()).toBe(undefined);
		expect(s1.spy).toHaveBeenCalledTimes(1);
		expect(s1.spy.mock.calls).toEqual([[undefined]]);

		manager.updateCacheOnExternalFrontmatterUpdate(testFilePath, { var1: 5 });

		expect(s1.signal.get()).toBe(5);
		expect(s1.spy).toHaveBeenCalledTimes(2);
		expect(s1.spy.mock.calls).toEqual([[undefined], [5]]);
	});

	test('should not update on external update after unsubscribing', () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));
		s1.subscription.unsubscribe();

		manager.updateCacheOnExternalFrontmatterUpdate(testFilePath, { var1: 5 });

		expect(s1.signal.get()).toBe(undefined);
		expect(s1.spy).toHaveBeenCalledTimes(1);
		expect(s1.spy.mock.calls).toEqual([[undefined]]);
	});

	test('should update all subscriptions on external update', () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));
		const s2 = subscribe(manager, createBindTarget(testFilePath, ['var2']));

		manager.updateCacheOnExternalFrontmatterUpdate(testFilePath, { var1: 5, var2: 6 });

		expect(s1.signal.get()).toBe(5);
		expect(s1.spy).toHaveBeenCalledTimes(2);
		expect(s1.spy.mock.calls).toEqual([[undefined], [5]]);

		expect(s2.signal.get()).toBe(6);
		expect(s2.spy).toHaveBeenCalledTimes(2);
		expect(s2.spy.mock.calls).toEqual([[undefined], [6]]);
	});

	test('should not update self', () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));

		s1.subscription.update(5);

		expect(s1.signal.get()).toBe(undefined);
		expect(s1.spy).toHaveBeenCalledTimes(1);
		expect(s1.spy.mock.calls).toEqual([[undefined]]);
	});

	test('should update different values independently', () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));
		const s2 = subscribe(manager, createBindTarget('otherFile', ['var1']));

		manager.updateCacheOnExternalFrontmatterUpdate(testFilePath, { var1: 5 });

		expect(s1.signal.get()).toBe(5);
		expect(s1.spy).toHaveBeenCalledTimes(2);
		expect(s1.spy.mock.calls).toEqual([[undefined], [5]]);

		expect(s2.signal.get()).toBe(undefined);
		expect(s2.spy).toHaveBeenCalledTimes(1);
		expect(s2.spy.mock.calls).toEqual([[undefined]]);
	});
});
