import { beforeEach, describe, expect, spyOn, test } from 'bun:test';
import { TestPlugin } from '../../mocks/TestAPI';
import { ToggleIPF } from '../../../src/fields/inputFields/fields/Toggle/ToggleIPF';
import { RenderChildType } from '../../../src/config/FieldConfigs';
import { TestIPFBase } from '../../mocks/TestIPFBase';
import { Metadata } from '../../../src/metadata/MetadataManagerCacheItem';
import { Signal } from '../../../src/utils/Signal';
import { getUUID } from '../../../src/utils/Utils';
import { parsePropPath } from '../../../src/utils/prop/PropParser';

const TEST_FILE_PATH = 'testFile';
const TEST_PROP = 'testProp';

describe('ToggleIPF test', () => {
	let testPlugin: TestPlugin;
	let ipfBase: TestIPFBase;
	let toggleIPF: ToggleIPF;

	beforeEach(() => {
		testPlugin = new TestPlugin();
		ipfBase = testPlugin.api.createInputFieldFromString(
			`INPUT[toggle:${TEST_PROP}]`,
			RenderChildType.BLOCK,
			TEST_FILE_PATH,
			document.body,
		);
	});

	function setup(initialMetadata: Record<string, unknown> | undefined): void {
		if (initialMetadata !== undefined) {
			// setting the initial metadata only works if the cache is already initialized, which happens when someone subscribes to the file
			const subscription = testPlugin.metadataManager.subscribe(
				getUUID(),
				new Signal<unknown>(undefined),
				{
					filePath: TEST_FILE_PATH,
					metadataPath: parsePropPath(['something_unused']),
					listenToChildren: false,
					boundToLocalScope: false,
				},
				() => {},
			);

			testPlugin.metadataManager.updateCacheOnExternalUpdate(TEST_FILE_PATH, initialMetadata);

			subscription.unsubscribe();
		}
		// make sure the metadata is set correctly
		expect<Metadata | undefined>(testPlugin.metadataManager.getCacheForFile(TEST_FILE_PATH)?.metadata).toEqual(
			initialMetadata,
		);
		// load the input field base and save a reference to the inner input field
		ipfBase.load();
		toggleIPF = ipfBase.inputField as ToggleIPF;
	}

	describe('load behaviour', () => {
		test('should load and value should be initial front-matter', () => {
			setup({ [TEST_PROP]: true });
			expect(toggleIPF.getValue()).toBe(true);
		});
	});
});
