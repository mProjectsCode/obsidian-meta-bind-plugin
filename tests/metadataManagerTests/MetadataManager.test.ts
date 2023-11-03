import { MetadataManager } from '../../src/metadata/MetadataManager';
import { MetadataSubscription } from '../../src/metadata/MetadataSubscription';
import { ComputedMetadataSubscription, ComputedSubscriptionDependency, ComputeFunction } from '../../src/metadata/ComputedMetadataSubscription';
import { getUUID } from '../../src/utils/Utils';
import { ListenerCallback, Signal } from '../../src/utils/Signal';
import { FullBindTarget } from '../../src/parsers/inputFieldParser/InputFieldDeclaration';
import { TestMetadataAdapter } from './mocks/TestMetadataAdapter';
import { describe, test, expect, beforeEach, spyOn, Mock } from 'bun:test';

type SubscribeArgs = Parameters<typeof MetadataManager.prototype.subscribe>;
type ComputedSubscribeArgs = Parameters<typeof MetadataManager.prototype.subscribeComputed>;

const testFilePath = 'testFile';

describe('metadata manager', () => {
	let manager: MetadataManager;

	let subscriptionSignals: Signal<unknown>[];
	let subscriptionSignalSpys: Mock<ListenerCallback<unknown>>[];
	let subscriptionBindTargets: FullBindTarget[];
	let subscriptionArgs: SubscribeArgs[];
	let subscriptions: MetadataSubscription[];

	let computedSubscriptionSignals: Signal<unknown>[];
	let computedSubscriptionSignalSpys: Mock<ListenerCallback<unknown>>[];
	let computedSubscriptionBindTargets: (FullBindTarget | undefined)[];
	let computedSubscriptionDependencies: ComputedSubscriptionDependency[][];
	let computedSubscriptionComputeFunctions: ComputeFunction[];
	let computedSubscriptionArgs: ComputedSubscribeArgs[];
	let computedSubscriptions: ComputedMetadataSubscription[];

	beforeEach(() => {
		// --- Subscriptions Setup ---

		subscriptionSignals = [new Signal<unknown>(undefined), new Signal<unknown>(undefined), new Signal<unknown>(undefined), new Signal<unknown>(undefined)];

		subscriptionBindTargets = [
			{
				filePath: testFilePath,
				metadataPath: ['numberField'],
				listenToChildren: false,
				boundToLocalScope: false,
			},
			{
				filePath: testFilePath,
				metadataPath: ['stringField'],
				listenToChildren: false,
				boundToLocalScope: false,
			},
			{
				filePath: testFilePath,
				metadataPath: ['booleanField'],
				listenToChildren: false,
				boundToLocalScope: false,
			},
			{
				filePath: testFilePath,
				metadataPath: ['arrayField'],
				listenToChildren: false,
				boundToLocalScope: false,
			},
		];

		// expect(subscriptionSignals.length).toBe(subscriptionBindTargets.length);

		subscriptionSignalSpys = [];
		subscriptionArgs = [];
		for (let i = 0; i < subscriptionSignals.length; i++) {
			subscriptionSignalSpys[i] = spyOn(subscriptionSignals[i], 'set');
			subscriptionArgs[i] = [getUUID(), subscriptionSignals[i], subscriptionBindTargets[i]];
		}

		subscriptions = [];

		// --- Computed Subscriptions Setup ---

		computedSubscriptionSignals = [new Signal<unknown>(undefined), new Signal<unknown>(undefined)];

		computedSubscriptionBindTargets = [
			{
				filePath: testFilePath,
				metadataPath: ['computedField'],
				listenToChildren: false,
				boundToLocalScope: false,
			},
			undefined,
		];

		computedSubscriptionDependencies = [
			[
				{
					bindTarget: subscriptionBindTargets[0],
					callbackSignal: new Signal<unknown>(undefined),
				},
				{
					bindTarget: subscriptionBindTargets[2],
					callbackSignal: new Signal<unknown>(undefined),
				},
			],
			[
				{
					bindTarget: subscriptionBindTargets[1],
					callbackSignal: new Signal<unknown>(undefined),
				},
				{
					bindTarget: subscriptionBindTargets[2],
					callbackSignal: new Signal<unknown>(undefined),
				},
			],
		];

		computedSubscriptionComputeFunctions = [
			(value: unknown[]): unknown => {
				return (value[0] as number) * (value[1] as number);
			},
			(value: unknown[]): unknown => {
				return (value[0] as number) + (value[1] as number);
			},
		];

		computedSubscriptionArgs = [];
		computedSubscriptionSignalSpys = [];
		for (let i = 0; i < computedSubscriptionSignals.length; i++) {
			computedSubscriptionSignalSpys[i] = spyOn(computedSubscriptionSignals[i], 'set');
			computedSubscriptionArgs[i] = [
				getUUID(),
				computedSubscriptionSignals[i],
				computedSubscriptionBindTargets[i],
				computedSubscriptionDependencies[i],
				computedSubscriptionComputeFunctions[i],
			];
		}

		computedSubscriptions = [];

		// --- Manager Setup ---

		const adapter = new TestMetadataAdapter(new Map());
		manager = new MetadataManager(adapter);
	});

	test('subscribing should change the signal value to the current cache value', () => {
		subscriptions[0] = manager.subscribe(...subscriptionArgs[0]);

		expect(subscriptionSignals[0].get()).toBe(undefined);
		expect(subscriptionSignalSpys[0]).toHaveBeenCalledTimes(1);
	});

	test('unsubscribing should not change the signal value', () => {
		subscriptions[0] = manager.subscribe(...subscriptionArgs[0]);
		subscriptions[0].unsubscribe();

		expect(subscriptionSignals[0].get()).toBe(undefined);
		expect(subscriptionSignalSpys[0]).toHaveBeenCalledTimes(1);
	});

	test('should update on external update', () => {
		subscriptions[0] = manager.subscribe(...subscriptionArgs[0]);

		expect(subscriptionSignals[0].get()).toBe(undefined);
		expect(subscriptionSignalSpys[0]).toHaveBeenCalledTimes(1);

		manager.updateCacheOnExternalUpdate(testFilePath, { numberField: 5 });

		expect(subscriptionSignals[0].get()).toBe(5);
		expect(subscriptionSignalSpys[0]).toHaveBeenCalledTimes(2);
	});

	test('should not update on external update after unsubscribing', () => {
		subscriptions[0] = manager.subscribe(...subscriptionArgs[0]);
		subscriptions[0].unsubscribe();

		manager.updateCacheOnExternalUpdate(testFilePath, { numberField: 5 });

		expect(subscriptionSignals[0].get()).toBe(undefined);
		expect(subscriptionSignalSpys[0]).toHaveBeenCalledTimes(1);
	});
});
