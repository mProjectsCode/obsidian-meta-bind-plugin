import { beforeEach, describe, expect, type Mock, spyOn, test } from 'bun:test';
import { TestMetadataSource } from '../../packages/core/src/metadata/InternalMetadataSources';
import {
	METADATA_CACHE_EXTERNAL_WRITE_LOCK_DURATION,
	METADATA_CACHE_INACTIVE_CYCLE_THRESHOLD,
	hasUpdateOverlap,
	metadataPathHasUpdateOverlap,
	MetadataManager,
} from '../../packages/core/src/metadata/MetadataManager';
import { type Metadata } from '../../packages/core/src/metadata/MetadataSource';
import { MetadataSubscription } from '../../packages/core/src/metadata/MetadataSubscription';
import {
	type BindTargetDeclaration,
	BindTargetStorageType,
} from '../../packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { MetaBindBindTargetError } from '../../packages/core/src/utils/errors/MetaBindErrors';
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

	test('should delete inactive cache items after threshold cycles', async () => {
		const source = manager.getSource(BindTargetStorageType.FRONTMATTER);
		if (source === undefined) {
			throw new Error('source not found');
		}

		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));
		s1.subscription.unsubscribe();

		expect(source.getCacheItemForStoragePath(testFilePath)).toBeDefined();

		for (let i = 0; i <= METADATA_CACHE_INACTIVE_CYCLE_THRESHOLD; i++) {
			await manager.cycle();
		}

		expect(source.getCacheItemForStoragePath(testFilePath)).toBeUndefined();
	});

	test('should ignore external updates while external write lock is active', async () => {
		const s1 = subscribe(manager, createBindTarget(testFilePath, ['var1']));

		s1.subscription.write(10);
		externalUpdate(manager, testFilePath, { var1: 99 });

		expect(s1.signal.get()).toBe(1);
		expect(s1.spy).toHaveBeenCalledTimes(1);

		for (let i = 0; i < METADATA_CACHE_EXTERNAL_WRITE_LOCK_DURATION; i++) {
			await manager.cycle();
		}

		externalUpdate(manager, testFilePath, { var1: 99 });

		expect(s1.signal.get()).toBe(99);
		expect(s1.spy).toHaveBeenCalledTimes(2);
		expect(s1.spy.mock.calls).toEqual([[1], [99]]);
	});

	test('should throw when setting unknown default source', () => {
		expect(() => manager.setDefaultSource('does-not-exist')).toThrow();
	});

	test('should delete all subscriptions for a storage path deletion', () => {
		const callbacks = {
			onDelete1: () => {},
			onDelete2: () => {},
		};
		const onDelete1Spy = spyOn(callbacks, 'onDelete1');
		const onDelete2Spy = spyOn(callbacks, 'onDelete2');

		const s1 = manager.subscribe(
			getUUID(),
			new Signal<unknown>(undefined),
			createBindTarget(testFilePath, ['var1']),
			callbacks.onDelete1,
		);
		const s2 = manager.subscribe(
			getUUID(),
			new Signal<unknown>(undefined),
			createBindTarget(testFilePath, ['var2']),
			callbacks.onDelete2,
		);

		manager.onStoragePathDeleted(testFilePath);

		expect(s1.deleted).toBe(true);
		expect(s2.deleted).toBe(true);
		expect(onDelete1Spy).toHaveBeenCalledTimes(1);
		expect(onDelete2Spy).toHaveBeenCalledTimes(1);
	});

	test('should delete all subscriptions for a storage path rename', () => {
		const callbacks = {
			onDelete1: () => {},
			onDelete2: () => {},
		};
		const onDelete1Spy = spyOn(callbacks, 'onDelete1');
		const onDelete2Spy = spyOn(callbacks, 'onDelete2');

		const s1 = manager.subscribe(
			getUUID(),
			new Signal<unknown>(undefined),
			createBindTarget(testFilePath, ['var1']),
			callbacks.onDelete1,
		);
		const s2 = manager.subscribe(
			getUUID(),
			new Signal<unknown>(undefined),
			createBindTarget(testFilePath, ['var2']),
			callbacks.onDelete2,
		);

		manager.onStoragePathRenamed(testFilePath, 'renamedFile');

		expect(s1.deleted).toBe(true);
		expect(s2.deleted).toBe(true);
		expect(onDelete1Spy).toHaveBeenCalledTimes(1);
		expect(onDelete2Spy).toHaveBeenCalledTimes(1);
	});

	test('should detect a derived subscription dependency loop', () => {
		manager.subscribeDerived(
			'd1',
			createBindTarget(testFilePath, ['var1']),
			[createBindTarget(testFilePath, ['var2'])],
			[new Signal<unknown>(undefined)],
			() => 1,
			() => {},
		);

		expect(() =>
			manager.subscribeDerived(
				'd2',
				createBindTarget(testFilePath, ['var2']),
				[createBindTarget(testFilePath, ['var1'])],
				[new Signal<unknown>(undefined)],
				() => 2,
				() => {},
			),
		).toThrow(MetaBindBindTargetError);
	});

	test('should skip initial derived computation when dependency is undefined', async () => {
		const targetA = createBindTarget(testFilePath, ['a']);
		const targetB = createBindTarget(testFilePath, ['b']);
		const targetC = createBindTarget(testFilePath, ['c']);
		const targetD = createBindTarget(testFilePath, ['d']);

		manager.write(1, targetA);

		const signalA = new Signal<unknown>(undefined);
		const signalB = new Signal<unknown>(undefined);
		const signalC = new Signal<unknown>(undefined);

		const cWrites: unknown[] = [];
		const dWrites: unknown[] = [];

		manager.subscribe(getUUID(), new Signal<unknown>(undefined), targetC, () => {});
		manager.subscribe(getUUID(), new Signal<unknown>(undefined), targetD, () => {});

		manager.subscribeDerived(
			'b',
			targetB,
			[targetA],
			[signalA],
			async () => {
				await new Promise(resolve => setTimeout(resolve, 0));
				return Number(signalA.get()) + 1;
			},
			() => {},
		);

		manager.subscribeDerived(
			'c',
			targetC,
			[targetB],
			[signalB],
			() => {
				const value = Number(signalB.get()) + 1;
				cWrites.push(value);
				return value;
			},
			() => {},
		);

		manager.subscribeDerived(
			'd',
			targetD,
			[targetC],
			[signalC],
			() => {
				const value = Number(signalC.get()) + 1;
				dWrites.push(value);
				return value;
			},
			() => {},
		);

		for (let i = 0; i < 10; i++) {
			await new Promise(resolve => setTimeout(resolve, 0));
		}

		expect(manager.read(targetB)).toBe(2);
		expect(manager.read(targetC)).toBe(3);
		expect(manager.read(targetD)).toBe(4);

		expect(cWrites).toEqual([3]);
		expect(dWrites).toEqual([4]);
	});
});

describe('metadata overlap helpers', () => {
	test('metadataPathHasUpdateOverlap should respect listenToChildren for parent listeners', () => {
		const parent = parsePropPath(['foo', 'bar']);
		const child = parsePropPath(['foo', 'bar', 'baz']);

		expect(metadataPathHasUpdateOverlap(parent, child, false)).toBe(true);
		expect(metadataPathHasUpdateOverlap(child, parent, false)).toBe(false);
		expect(metadataPathHasUpdateOverlap(child, parent, true)).toBe(true);
	});

	test('hasUpdateOverlap should return false for different storage path or type', () => {
		const base = createBindTarget(testFilePath, ['foo']);
		const differentPath = createBindTarget(otherFilePath, ['foo']);
		const differentType: BindTargetDeclaration = {
			...base,
			storageType: BindTargetStorageType.MEMORY,
		};

		expect(hasUpdateOverlap(base, differentPath)).toBe(false);
		expect(hasUpdateOverlap(base, differentType)).toBe(false);
	});
});
