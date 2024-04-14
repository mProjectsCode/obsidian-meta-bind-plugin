import { METADATA_CACHE_UPDATE_CYCLE_THRESHOLD, MetadataManager } from 'packages/core/src/metadata/MetadataManager';
import { IPlugin } from 'packages/core/src/IPlugin';
import { DEFAULT_SETTINGS, MetaBindPluginSettings } from 'packages/core/src/Settings';
import {
	GlobalMetadataSource,
	InternalMetadataSource,
	ScopeMetadataSource,
} from 'packages/core/src/metadata/InternalMetadataSources';
import { DateParser } from 'packages/core/src/parsers/DateParser';
import {
	BindTargetDeclaration,
	BindTargetStorageType,
} from 'packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { setFirstWeekday } from 'packages/core/src/utils/DatePickerUtils';
import { TestAPI } from './TestAPI';
import { TestInternalAPI } from './TestInternalAPI';
import { InputFieldMountable } from 'packages/core/src/fields/inputFields/InputFieldMountable';
import { InputField } from 'packages/core/src/fields/inputFields/InputFieldFactory';
import { expect, Mock, spyOn } from 'bun:test';
import { getUUID } from 'packages/core/src/utils/Utils';
import { Metadata } from 'packages/core/src/metadata/MetadataSource';
import { Signal } from 'packages/core/src/utils/Signal';
import { parsePropPath } from 'packages/core/src/utils/prop/PropParser';
import type { IMetadataSubscription } from 'packages/core/src/metadata/IMetadataSubscription';
import { MountableManager } from 'packages/core/src/MountableManager';
import { RenderChildType } from 'packages/core/src/config/APIConfigs';

/**
 * A default value to indicate that a field should be it's the default value.
 */
export const DEFAULT_VALUE_INDICATOR = '$$default$$';

export interface UninitializedTestInputField {
	mountable: InputFieldMountable;
}

export interface TestInputField {
	mountable: InputFieldMountable;
	field: InputField;
	fieldSignalSetSpy: Mock<(value: any) => void>;
}

export class TestPlugin implements IPlugin {
	public api: TestAPI;
	public metadataManager: MetadataManager;
	public internal: TestInternalAPI;
	public mountableManager: MountableManager;

	public settings: MetaBindPluginSettings;

	public uninitializedTestInputFields: UninitializedTestInputField[] = [];
	public testInputFields: TestInputField[] = [];

	public testFilePath: string = 'test/file.md';
	public inTestSetup: boolean = true;
	public metadataManagerInternalUpdateSpy:
		| Mock<(value: unknown, bindTarget: BindTargetDeclaration) => void>
		| undefined;

	constructor() {
		this.api = new TestAPI(this);
		this.internal = new TestInternalAPI(this);
		this.metadataManager = new MetadataManager();
		this.setUpMetadataManager();

		this.mountableManager = new MountableManager();

		this.settings = DEFAULT_SETTINGS;

		DateParser.dateFormat = this.settings.preferredDateFormat;
		setFirstWeekday(this.settings.firstWeekday);
	}

	setUpMetadataManager(): void {
		this.metadataManager.registerSource(
			new InternalMetadataSource(BindTargetStorageType.FRONTMATTER, this.metadataManager),
		);
		this.metadataManager.registerSource(
			new InternalMetadataSource(BindTargetStorageType.MEMORY, this.metadataManager),
		);
		this.metadataManager.registerSource(
			new GlobalMetadataSource(BindTargetStorageType.GLOBAL_MEMORY, this.metadataManager),
		);
		this.metadataManager.registerSource(new ScopeMetadataSource(BindTargetStorageType.SCOPE, this.metadataManager));

		this.metadataManager.setDefaultSource(BindTargetStorageType.FRONTMATTER);
	}

	addTestInputField(declaration: string, filePath?: string): number {
		if (!this.inTestSetup) {
			throw new Error('Cannot add test input field outside of test setup');
		}

		const mountable = this.api.createInputFieldMountable(filePath ?? this.testFilePath, {
			declaration: declaration,
			renderChildType: RenderChildType.BLOCK,
			scope: undefined,
		});

		const test: UninitializedTestInputField = { mountable: mountable };

		this.uninitializedTestInputFields.push(test);

		return this.uninitializedTestInputFields.length - 1;
	}

	initializeTest(): void {
		this.testInputFields = new Array(this.uninitializedTestInputFields.length);

		this.metadataManagerInternalUpdateSpy = spyOn(this.metadataManager, 'write');

		this.inTestSetup = false;
	}

	initializeAllTestInputFields(): void {
		for (let i = 0; i < this.uninitializedTestInputFields.length; i++) {
			this.initializeTestInputField(i);
		}
	}

	initializeTestInputField(index: number): void {
		if (this.inTestSetup) {
			throw new Error('Cannot initialize test input field inside of test setup');
		}

		if (index < 0 || index >= this.uninitializedTestInputFields.length) {
			throw new Error('Invalid index');
		}

		const test = this.uninitializedTestInputFields[index];
		test.mountable.mount(document.body);

		const field = test.mountable.inputField as InputField;
		const fieldSignalSetSpy = spyOn(field.computedSignal, 'set');
		this.testInputFields[index] = { mountable: test.mountable, field, fieldSignalSetSpy };
	}

	getTestInputField(index: number): TestInputField {
		if (index < 0 || index >= this.testInputFields.length) {
			throw new Error('Invalid index');
		}

		return this.testInputFields[index];
	}

	getTestInputFieldValue(index: number): unknown {
		return this.getTestInputField(index).field.getValue();
	}

	getAllTestInputFieldValues(): unknown[] {
		return this.testInputFields.map(x => x.field.getValue());
	}

	getAllTestInputFieldDefaultValues(): unknown[] {
		return this.testInputFields.map(x => x.field.getDefaultValue());
	}

	getAllTestInputFieldSpys(): Mock<(value: any) => void>[] {
		return this.testInputFields.map(x => x.fieldSignalSetSpy);
	}

	setTestInputFieldValue(index: number, value: any): void {
		this.getTestInputField(index).field.setValue(value as never);
	}

	expectAllTestInputFieldSpysToHaveBeenCalledTimes(times: number[]): void {
		if (times.length !== this.testInputFields.length) {
			throw new Error('Invalid times length');
		}

		for (const [spy, time] of this.getAllTestInputFieldSpys().map((x, i) => [x, times[i]] as const)) {
			expect(spy).toHaveBeenCalledTimes(time);
		}
	}

	expectAllTestInputFieldSpysToHaveBeenCalledTimesOrLess(times: number[]): void {
		if (times.length !== this.testInputFields.length) {
			throw new Error('Invalid times length');
		}

		for (const [spy, time] of this.getAllTestInputFieldSpys().map((x, i) => [x, times[i]] as const)) {
			expect(spy.mock.calls.length).toBeLessThanOrEqual(time);
		}
	}

	expectAllTestInputFieldValuesToEqual(values: any[]): void {
		if (values.length !== this.testInputFields.length) {
			throw new Error('Invalid values length');
		}

		for (const [testInputField, value] of this.testInputFields.map((x, i) => [x, values[i]] as const)) {
			if (value === DEFAULT_VALUE_INDICATOR) {
				expect(testInputField.field.getValue()).toEqual(testInputField.field.getDefaultValue());
			} else {
				expect(testInputField.field.getValue()).toEqual(value);
			}
		}
	}

	createInitialCache(initialMetadata: Metadata, filePath?: string): void {
		// setting the initial metadata only works if the cache is already initialized, which happens when someone subscribes to the file
		const subscription = this.metadataManager.subscribe(
			getUUID(),
			new Signal<unknown>(undefined),
			{
				storageType: BindTargetStorageType.FRONTMATTER,
				storagePath: filePath ?? this.testFilePath,
				storageProp: parsePropPath(['something_unused']),
				listenToChildren: false,
			},
			() => {},
		);

		this.setCacheExternally(initialMetadata);

		subscription.unsubscribe();

		// make sure the metadata is set correctly
		expect<Metadata | undefined>(this.getCacheMetadata()).toEqual(initialMetadata);
	}

	setCacheExternally(metadata: Metadata, filePath?: string): void {
		const source = this.metadataManager.getSource(BindTargetStorageType.FRONTMATTER);
		if (!source) {
			throw new Error('source not found');
		}
		this.metadataManager.onExternalUpdate(source, filePath ?? this.testFilePath, metadata);
	}

	getCacheMetadata(filePath?: string): Metadata | undefined {
		const source = this.metadataManager.getSource(BindTargetStorageType.FRONTMATTER);
		if (!source) {
			throw new Error('source not found');
		}
		const cacheItem = source.getCacheItemForStoragePath(filePath ?? this.testFilePath);
		if (!cacheItem) {
			throw new Error('cache item not found');
		}

		return source.readEntireCacheItem(cacheItem);
	}

	cycleMetadataManager(): void {
		this.metadataManager.cycle();
	}

	expectMetadataManagerToHaveUpdatedTimes(times: number): void {
		expect(this.metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(times);
	}

	public cycleMetadataManagerUntilThreshold(): void {
		for (let i = 0; i < METADATA_CACHE_UPDATE_CYCLE_THRESHOLD; i++) {
			this.cycleMetadataManager();
		}
	}
}
