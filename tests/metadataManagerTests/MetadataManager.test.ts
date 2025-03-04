import { beforeEach, describe, expect, type Mock, spyOn, test } from 'bun:test';
import { TestMetadataSource } from '../../packages/core/src/metadata/InternalMetadataSources';
import { MetadataManager } from '../../packages/core/src/metadata/MetadataManager';
import { type Metadata } from '../../packages/core/src/metadata/MetadataSource';
import { MetadataSubscription } from '../../packages/core/src/metadata/MetadataSubscription';
import {
	type BindTargetDeclaration,
	BindTargetStorageType,
} from '../../packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { parsePropPath } from '../../packages/core/src/utils/prop/PropParser';
import { type ListenerCallback, Signal } from '../../packages/core/src/utils/Signal';
import { getUUID } from '../../packages/core/src/utils/Utils';

const testFilePath = 'testFile';
const otherFilePath = 'otherFile';

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

function externalUpdate(manager: MetadataManager, filePath: string, value: Metadata): void {
	const source = manager.sources.get(BindTargetStorageType.FRONTMATTER);
	if (source) {
		manager.onExternalUpdate(source, filePath, value);
	}
}

describe('metadata manager', () => {
	let manager: MetadataManager;

	beforeEach(() => {
		manager = new MetadataManager();
		const testSource = new TestMetadataSource(BindTargetStorageType.FRONTMATTER, manager, {
			[testFilePath]: { var1: 1, var2: 2 },
			[otherFilePath]: { var1: 1, var2: 2 },
		});
		manager.registerSource(testSource);
	});

	test('subscribing should change the signal value to the current cache value', () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));

		expect(s1.signal.get()).toBe(1);
		expect(s1.spy).toHaveBeenCalledTimes(1);
		expect(s1.spy.mock.calls).toEqual([[1]]);
	});

	test('unsubscribing should not change the signal value', () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));
		s1.subscription.unsubscribe();

		expect(s1.signal.get()).toBe(1);
		expect(s1.spy).toHaveBeenCalledTimes(1);
		expect(s1.spy.mock.calls).toEqual([[1]]);
	});

	test('should update on external update', () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));

		expect(s1.signal.get()).toBe(1);
		expect(s1.spy).toHaveBeenCalledTimes(1);
		expect(s1.spy.mock.calls).toEqual([[1]]);

		externalUpdate(manager, testFilePath, { var1: 5 });

		expect(s1.signal.get()).toBe(5);
		expect(s1.spy).toHaveBeenCalledTimes(2);
		expect(s1.spy.mock.calls).toEqual([[1], [5]]);
	});

	test('should not update on external update after unsubscribing', () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));
		s1.subscription.unsubscribe();

		externalUpdate(manager, testFilePath, { var1: 5 });

		expect(s1.signal.get()).toBe(1);
		expect(s1.spy).toHaveBeenCalledTimes(1);
		expect(s1.spy.mock.calls).toEqual([[1]]);
	});

	test('should update all changed subscriptions on external update', () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));
		const s2 = subscribe(manager, createBindTarget(testFilePath, ['var2']));

		externalUpdate(manager, testFilePath, { var1: 5, var2: 6 });

		expect(s1.signal.get()).toBe(5);
		expect(s1.spy).toHaveBeenCalledTimes(2);
		expect(s1.spy.mock.calls).toEqual([[1], [5]]);

		expect(s2.signal.get()).toBe(6);
		expect(s2.spy).toHaveBeenCalledTimes(2);
		expect(s2.spy.mock.calls).toEqual([[2], [6]]);
	});

	test('should update only changed subscriptions on external update', () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));
		const s2 = subscribe(manager, createBindTarget(testFilePath, ['var2']));

		externalUpdate(manager, testFilePath, { var1: 5, var2: 2 });

		expect(s1.signal.get()).toBe(5);
		expect(s1.spy).toHaveBeenCalledTimes(2);
		expect(s1.spy.mock.calls).toEqual([[1], [5]]);

		expect(s2.signal.get()).toBe(2);
		expect(s2.spy).toHaveBeenCalledTimes(1);
		expect(s2.spy.mock.calls).toEqual([[2]]);
	});

	test('should not update self', () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));

		s1.subscription.write(5);

		expect(s1.signal.get()).toBe(1);
		expect(s1.spy).toHaveBeenCalledTimes(1);
		expect(s1.spy.mock.calls).toEqual([[1]]);
	});

	test('should update different values independently', () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));
		const s2 = subscribe(manager, createBindTarget(otherFilePath, ['var1']));

		externalUpdate(manager, testFilePath, { var1: 5 });

		expect(s1.signal.get()).toBe(5);
		expect(s1.spy).toHaveBeenCalledTimes(2);
		expect(s1.spy.mock.calls).toEqual([[1], [5]]);

		expect(s2.signal.get()).toBe(1);
		expect(s2.spy).toHaveBeenCalledTimes(1);
		expect(s2.spy.mock.calls).toEqual([[1]]);
	});
});
