import { beforeEach, describe, expect, spyOn, test } from 'bun:test';
import { TestPlugin } from '../mocks/TestAPI';
import { InputFieldType, RenderChildType } from '../../src/config/FieldConfigs';
import { TestIPFBase } from '../mocks/TestIPFBase';
import { Metadata } from '../../src/metadata/MetadataManagerCacheItem';
import { Signal } from '../../src/utils/Signal';
import { getUUID } from '../../src/utils/Utils';
import { parsePropPath } from '../../src/utils/prop/PropParser';
import { InputField } from '../../src/fields/inputFields/InputFieldFactory';
import { stringifyLiteral } from '../../src/utils/Literal';
import { Stream } from 'itertools-ts';
import { multi } from 'itertools-ts/es';
import { METADATA_CACHE_UPDATE_CYCLE_THRESHOLD } from '../../src/metadata/MetadataManager';

const TEST_FILE_PATH = 'testFile';
const TEST_PROP = 'testProp';

const TEST_VALUES = {
	UNDEFINED: undefined,
	NULL: null,

	EMPTY_STRING: '',
	STRING: 'string',

	TRUE: true,
	FALSE: false,

	BOOLEAN_STRING_TURE: 'true',
	BOOLEAN_STRING_TURE_CAPITAL: 'True',
	BOOLEAN_STRING_TURE_CAPITAL_2: 'TRUE',
	BOOLEAN_STRING_FALSE: 'false',
	BOOLEAN_STRING_FALSE_CAPITAL: 'False',
	BOOLEAN_STRING_FALSE_CAPITAL_2: 'FALSE',

	POSITIVE_INT: 123,
	NEGATIVE_INT: -123,
	POSITIVE_FLOAT: 123.456,
	NEGATIVE_FLOAT: -123.456,

	POSITIVE_NUMBER_STRING: '123',
	NEGATIVE_NUMBER_STRING: '-123',
	POSITIVE_FLOAT_STRING: '123.456',
	NEGATIVE_FLOAT_STRING: '-123.456',

	EMPTY_OBJECT: {},
	OBJECT: { a: 1, b: 2 },

	EMPTY_ARRAY: [],
	ARRAY: [1, 2, 3],
} as const;

interface IPFTest {
	type: InputFieldType;
	testCases: IPFTestCase[];
}

interface IPFTestCase {
	declaration: string;
	validValues?: any[];
	validMappedValues?: [any, any][];
	invalidValues?: any[];
}

const STANDARD_OPTION_VALUES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const STANDARD_OPTION_ARGUMENTS = STANDARD_OPTION_VALUES.map(x => `option(${x})`).join(', ');
const STANDARD_OPTION_VALUES_ARRAY = [['a', 'b'], ['c', 'd', 'e'], ['f', 'g', 'h', 'i'], ['j']];

let TEST_CONFIG: IPFTest[] = [
	{
		type: InputFieldType.TOGGLE,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.TOGGLE}:${TEST_PROP}]`,
				validValues: [true, false],
				invalidValues: [
					0,
					2,
					TEST_VALUES.EMPTY_STRING,
					TEST_VALUES.STRING,
					TEST_VALUES.UNDEFINED,
					TEST_VALUES.NULL,
					TEST_VALUES.OBJECT,
					TEST_VALUES.ARRAY,
				],
			},
		],
	},
	{
		type: InputFieldType.SLIDER,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.SLIDER}:${TEST_PROP}]`,
				validValues: [0, 1, 5, 100],
				validMappedValues: [
					['0', 0],
					['1', 1],
					['5', 5],
					['100', 100],
				],
				invalidValues: [
					-1,
					TEST_VALUES.EMPTY_STRING,
					TEST_VALUES.STRING,
					TEST_VALUES.UNDEFINED,
					TEST_VALUES.NULL,
					TEST_VALUES.OBJECT,
					TEST_VALUES.ARRAY,
				],
			},
		],
	},
	{
		type: InputFieldType.TEXT,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.TEXT}:${TEST_PROP}]`,
				validValues: [TEST_VALUES.EMPTY_STRING, TEST_VALUES.STRING],
				validMappedValues: [
					[TEST_VALUES.POSITIVE_INT, stringifyLiteral(TEST_VALUES.POSITIVE_INT)],
					[TEST_VALUES.NEGATIVE_INT, stringifyLiteral(TEST_VALUES.NEGATIVE_INT)],
					[TEST_VALUES.POSITIVE_FLOAT, stringifyLiteral(TEST_VALUES.POSITIVE_FLOAT)],
					[TEST_VALUES.NEGATIVE_FLOAT, stringifyLiteral(TEST_VALUES.NEGATIVE_FLOAT)],
					[TEST_VALUES.TRUE, stringifyLiteral(TEST_VALUES.TRUE)],
					[TEST_VALUES.FALSE, stringifyLiteral(TEST_VALUES.FALSE)],
				],
				invalidValues: [TEST_VALUES.UNDEFINED, TEST_VALUES.NULL, TEST_VALUES.OBJECT, TEST_VALUES.ARRAY],
			},
		],
	},
	{
		type: InputFieldType.TEXT_AREA,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.TEXT_AREA}:${TEST_PROP}]`,
				validValues: [TEST_VALUES.EMPTY_STRING, TEST_VALUES.STRING],
				validMappedValues: [
					[TEST_VALUES.POSITIVE_INT, stringifyLiteral(TEST_VALUES.POSITIVE_INT)],
					[TEST_VALUES.NEGATIVE_INT, stringifyLiteral(TEST_VALUES.NEGATIVE_INT)],
					[TEST_VALUES.POSITIVE_FLOAT, stringifyLiteral(TEST_VALUES.POSITIVE_FLOAT)],
					[TEST_VALUES.NEGATIVE_FLOAT, stringifyLiteral(TEST_VALUES.NEGATIVE_FLOAT)],
					[TEST_VALUES.TRUE, stringifyLiteral(TEST_VALUES.TRUE)],
					[TEST_VALUES.FALSE, stringifyLiteral(TEST_VALUES.FALSE)],
				],
				invalidValues: [TEST_VALUES.UNDEFINED, TEST_VALUES.NULL, TEST_VALUES.OBJECT, TEST_VALUES.ARRAY],
			},
		],
	},
	{
		type: InputFieldType.SELECT,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.SELECT}(${STANDARD_OPTION_ARGUMENTS}):${TEST_PROP}]`,
				validValues: [...STANDARD_OPTION_VALUES, TEST_VALUES.STRING, TEST_VALUES.EMPTY_STRING],
				invalidValues: [TEST_VALUES.UNDEFINED, TEST_VALUES.NULL, TEST_VALUES.OBJECT],
			},
		],
	},
	{
		type: InputFieldType.MULTI_SELECT,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.MULTI_SELECT}(${STANDARD_OPTION_ARGUMENTS}):${TEST_PROP}]`,
				validValues: [...STANDARD_OPTION_VALUES_ARRAY, [TEST_VALUES.STRING], [TEST_VALUES.EMPTY_STRING]],
				validMappedValues: [[TEST_VALUES.NULL, [TEST_VALUES.NULL]]],
				invalidValues: [TEST_VALUES.UNDEFINED, TEST_VALUES.OBJECT],
			},
		],
	},
	{
		type: InputFieldType.DATE_PICKER,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.DATE_PICKER}:${TEST_PROP}]`,
				validValues: ['2021-01-01', '2021-01-02', '2021-01-03'],
				invalidValues: [
					TEST_VALUES.UNDEFINED,
					TEST_VALUES.NULL,
					TEST_VALUES.OBJECT,
					TEST_VALUES.ARRAY,
					TEST_VALUES.EMPTY_STRING,
					TEST_VALUES.STRING,
					TEST_VALUES.POSITIVE_INT,
					TEST_VALUES.NEGATIVE_INT,
				],
			},
		],
	},
	{
		type: InputFieldType.NUMBER,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.NUMBER}:${TEST_PROP}]`,
				validValues: [-1, 0, 1, 5, 100],
				validMappedValues: [
					['-1', -1],
					['0', 0],
					['1', 1],
					['5', 5],
					['100', 100],
				],
				invalidValues: [
					TEST_VALUES.EMPTY_STRING,
					TEST_VALUES.STRING,
					TEST_VALUES.UNDEFINED,
					TEST_VALUES.NULL,
					TEST_VALUES.OBJECT,
					TEST_VALUES.ARRAY,
				],
			},
		],
	},
	{
		type: InputFieldType.SUGGESTER,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.SUGGESTER}(${STANDARD_OPTION_ARGUMENTS}):${TEST_PROP}]`,
				validValues: [...STANDARD_OPTION_VALUES, TEST_VALUES.STRING, TEST_VALUES.EMPTY_STRING],
				invalidValues: [TEST_VALUES.UNDEFINED, TEST_VALUES.NULL, TEST_VALUES.OBJECT],
			},
		],
	},
	{
		type: InputFieldType.EDITOR,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.EDITOR}:${TEST_PROP}]`,
				validValues: [TEST_VALUES.EMPTY_STRING, TEST_VALUES.STRING],
				validMappedValues: [
					[TEST_VALUES.POSITIVE_INT, stringifyLiteral(TEST_VALUES.POSITIVE_INT)],
					[TEST_VALUES.NEGATIVE_INT, stringifyLiteral(TEST_VALUES.NEGATIVE_INT)],
					[TEST_VALUES.POSITIVE_FLOAT, stringifyLiteral(TEST_VALUES.POSITIVE_FLOAT)],
					[TEST_VALUES.NEGATIVE_FLOAT, stringifyLiteral(TEST_VALUES.NEGATIVE_FLOAT)],
					[TEST_VALUES.TRUE, stringifyLiteral(TEST_VALUES.TRUE)],
					[TEST_VALUES.FALSE, stringifyLiteral(TEST_VALUES.FALSE)],
				],
				invalidValues: [TEST_VALUES.UNDEFINED, TEST_VALUES.NULL, TEST_VALUES.OBJECT, TEST_VALUES.ARRAY],
			},
		],
	},
	{
		type: InputFieldType.PROGRESS_BAR,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.PROGRESS_BAR}:${TEST_PROP}]`,
				validValues: [0, 1, 5, 100],
				validMappedValues: [
					['0', 0],
					['1', 1],
					['5', 5],
					['100', 100],
				],
				invalidValues: [
					-1,
					TEST_VALUES.EMPTY_STRING,
					TEST_VALUES.STRING,
					TEST_VALUES.UNDEFINED,
					TEST_VALUES.NULL,
					TEST_VALUES.OBJECT,
					TEST_VALUES.ARRAY,
				],
			},
		],
	},
	{
		type: InputFieldType.INLINE_SELECT,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.INLINE_SELECT}(${STANDARD_OPTION_ARGUMENTS}):${TEST_PROP}]`,
				validValues: [...STANDARD_OPTION_VALUES, TEST_VALUES.STRING, TEST_VALUES.EMPTY_STRING],
				invalidValues: [TEST_VALUES.UNDEFINED, TEST_VALUES.NULL, TEST_VALUES.OBJECT],
			},
		],
	},
	{
		type: InputFieldType.IMAGE_SUGGESTER,
		testCases: [],
		// declaration: `INPUT[${InputFieldType.IMAGE_SUGGESTER}(${STANDARD_OPTION_ARGUMENTS}):${TEST_PROP}]`,
		// exampleValues: STANDARD_OPTION_VALUES, // TODO: fix image to uri app not found
	},
	{
		type: InputFieldType.LIST,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.LIST}:${TEST_PROP}]`,
				validValues: STANDARD_OPTION_VALUES_ARRAY,
				validMappedValues: [
					[TEST_VALUES.NULL, [TEST_VALUES.NULL]],
					[TEST_VALUES.STRING, [TEST_VALUES.STRING]],
					[TEST_VALUES.EMPTY_STRING, [TEST_VALUES.EMPTY_STRING]],
				],
				invalidValues: [TEST_VALUES.UNDEFINED, TEST_VALUES.OBJECT],
			},
		],
	},
	{
		type: InputFieldType.LIST_SUGGESTER,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.LIST_SUGGESTER}(${STANDARD_OPTION_ARGUMENTS}):${TEST_PROP}]`,
				validValues: STANDARD_OPTION_VALUES_ARRAY,
				validMappedValues: [
					[TEST_VALUES.NULL, [TEST_VALUES.NULL]],
					[TEST_VALUES.STRING, [TEST_VALUES.STRING]],
					[TEST_VALUES.EMPTY_STRING, [TEST_VALUES.EMPTY_STRING]],
				],
				invalidValues: [TEST_VALUES.UNDEFINED, TEST_VALUES.OBJECT],
			},
		],
	},
	{
		type: InputFieldType.DATE,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.DATE}:${TEST_PROP}]`,
				validValues: ['2021-01-01', '2021-01-02', '2021-01-03'],
				invalidValues: [
					TEST_VALUES.UNDEFINED,
					TEST_VALUES.NULL,
					TEST_VALUES.OBJECT,
					TEST_VALUES.ARRAY,
					TEST_VALUES.EMPTY_STRING,
					TEST_VALUES.STRING,
					TEST_VALUES.POSITIVE_INT,
					TEST_VALUES.NEGATIVE_INT,
				],
			},
		],
	},
	{
		type: InputFieldType.TIME,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.TIME}:${TEST_PROP}]`,
				validValues: ['14:45', '05:03'],
				invalidValues: [
					TEST_VALUES.UNDEFINED,
					TEST_VALUES.NULL,
					TEST_VALUES.OBJECT,
					TEST_VALUES.ARRAY,
					TEST_VALUES.EMPTY_STRING,
					TEST_VALUES.STRING,
					TEST_VALUES.POSITIVE_INT,
					TEST_VALUES.NEGATIVE_INT,
				],
			},
		],
	},
	{
		type: InputFieldType.INLINE_LIST_SUGGESTER,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.INLINE_LIST_SUGGESTER}(${STANDARD_OPTION_ARGUMENTS}):${TEST_PROP}]`,
				validValues: STANDARD_OPTION_VALUES_ARRAY,
				validMappedValues: [
					[TEST_VALUES.NULL, [TEST_VALUES.NULL]],
					[TEST_VALUES.STRING, [TEST_VALUES.STRING]],
					[TEST_VALUES.EMPTY_STRING, [TEST_VALUES.EMPTY_STRING]],
				],
				invalidValues: [TEST_VALUES.UNDEFINED, TEST_VALUES.OBJECT],
			},
		],
	},
	{
		type: InputFieldType.INLINE_LIST,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.INLINE_LIST}:${TEST_PROP}]`,
				validValues: STANDARD_OPTION_VALUES_ARRAY,
				validMappedValues: [
					[TEST_VALUES.NULL, [TEST_VALUES.NULL]],
					[TEST_VALUES.STRING, [TEST_VALUES.STRING]],
					[TEST_VALUES.EMPTY_STRING, [TEST_VALUES.EMPTY_STRING]],
				],
				invalidValues: [TEST_VALUES.UNDEFINED, TEST_VALUES.OBJECT],
			},
		],
	},
];

function getTestName(value: any): string {
	return JSON.stringify(value) ?? 'undefined';
}

describe('IPF', () => {
	let testPlugin: TestPlugin;
	let ipfBase: TestIPFBase;
	let ipf: InputField;

	let ipfBase1: TestIPFBase;
	let ipfBase2: TestIPFBase;
	let ipf1: InputField;
	let ipf2: InputField;

	function setup(testCase: IPFTestCase): void {
		testPlugin = new TestPlugin();

		ipfBase = testPlugin.api.createInputFieldFromString(
			testCase.declaration,
			RenderChildType.BLOCK,
			TEST_FILE_PATH,
			document.body,
		);

		ipf = ipfBase.inputField as InputField;
	}

	function loadIPF(): void {
		ipfBase.load();
	}

	function setupTwoIPFs(testCase: IPFTestCase): void {
		testPlugin = new TestPlugin();

		ipfBase1 = testPlugin.api.createInputFieldFromString(
			testCase.declaration,
			RenderChildType.BLOCK,
			TEST_FILE_PATH,
			document.body,
		);

		ipfBase2 = testPlugin.api.createInputFieldFromString(
			testCase.declaration,
			RenderChildType.BLOCK,
			TEST_FILE_PATH,
			document.body,
		);

		ipf1 = ipfBase1.inputField as InputField;
		ipf2 = ipfBase2.inputField as InputField;
	}

	function loadIPF1(): void {
		ipfBase1.load();
	}

	function loadIPF2(): void {
		ipfBase2.load();
	}

	function createInitialCache(initialMetadata: Metadata): void {
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

		setCacheExternally(initialMetadata);

		subscription.unsubscribe();

		// make sure the metadata is set correctly
		expect<Metadata | undefined>(getCacheMetadata()).toEqual(initialMetadata);
	}

	function setCacheExternally(metadata: Metadata): void {
		testPlugin.metadataManager.updateCacheOnExternalUpdate(TEST_FILE_PATH, metadata);
	}

	function getCacheMetadata(): Metadata | undefined {
		return testPlugin.metadataManager.getCacheForFile(TEST_FILE_PATH)?.metadata;
	}

	function updateMetadataManager(): void {
		testPlugin.metadataManager.update();
	}

	function runTestCase(TEST_CONFIG: IPFTest, TEST_CASE: IPFTestCase): void {
		describe('load behaviour', () => {
			describe('should load with front-matter value if front-matter value is valid for that IPF', () => {
				for (const validValue of TEST_CASE.validValues ?? []) {
					test(getTestName(validValue), () => {
						setup(TEST_CASE);
						// add some metadata to the test file
						createInitialCache({ [TEST_PROP]: validValue });

						const ipfSignalSetSpy = spyOn(ipf.computedSignal, 'set');
						const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

						// load the input field
						loadIPF();

						// check that the input field value is the value of the bound property in the front-matter cache
						expect(ipf.getValue()).toEqual(validValue);
						// check that the value of the IPF has only been set once
						expect(ipfSignalSetSpy).toHaveBeenCalledTimes(1);
						// check that the input field did not update the metadata manager
						expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(0);
					});
				}

				for (const validValue of TEST_CASE.validMappedValues ?? []) {
					test(`${getTestName(validValue[0])} reads as ${getTestName(validValue[1])}`, () => {
						setup(TEST_CASE);
						// add some metadata to the test file
						createInitialCache({ [TEST_PROP]: validValue[0] });

						const ipfSignalSetSpy = spyOn(ipf.computedSignal, 'set');
						const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

						// load the input field
						loadIPF();

						// check that the input field value represents the value of the bound property in the front-matter cache
						expect(ipf.getValue()).toEqual(validValue[1]);
						// check that the value of the IPF has only been set once
						expect(ipfSignalSetSpy).toHaveBeenCalledTimes(1);
						// check that the input field did not update the metadata manager
						expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(0);
					});
				}
			});

			describe('should load with default value if front-matter value is invalid for that IPF', () => {
				for (const invalidValue of TEST_CASE.invalidValues ?? []) {
					test(getTestName(invalidValue), () => {
						setup(TEST_CASE);
						// add some metadata to the test file
						createInitialCache({ [TEST_PROP]: invalidValue });

						const ipfSignalSetSpy = spyOn(ipf.computedSignal, 'set');
						const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

						// load the input field
						loadIPF();

						// check that the input field value is the default value of the IPF, since the front-matter value is invalid
						expect(ipf.getValue()).toEqual(ipf.getDefaultValue());
						// check that the value of the IPF has only been set once
						expect(ipfSignalSetSpy).toHaveBeenCalledTimes(1);
						// check that the input field did not update the metadata manager
						expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(0);
					});
				}
			});

			test('should load with default value when front-matter field not present', () => {
				setup(TEST_CASE);

				const ipfSignalSetSpy = spyOn(ipf.computedSignal, 'set');
				const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

				// load the input field without any metadata being set
				loadIPF();

				// check that the input field value is the default value
				expect(ipf.getValue()).toEqual(ipf.getDefaultValue());
				// check that the value of the IPF has only been set once
				expect(ipfSignalSetSpy).toHaveBeenCalledTimes(1);
				// check that the input field did not update the metadata manager
				expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(0);
			});
		});

		describe('external update behaviour', () => {
			describe('should update to front-matter value if front-matter value is valid for that IPF', () => {
				for (const validValue of TEST_CASE.validValues ?? []) {
					test(getTestName(validValue), () => {
						setup(TEST_CASE);

						const ipfSignalSetSpy = spyOn(ipf.computedSignal, 'set');
						const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

						// load the input field
						loadIPF();

						setCacheExternally({ [TEST_PROP]: validValue });

						// check that the input field value is the value of the bound property in the front-matter cache
						expect(ipf.getValue()).toEqual(validValue);
						// check that the value of the IPF has only been set once
						expect(ipfSignalSetSpy).toHaveBeenCalledTimes(2);
						// check that the input field did not update the metadata manager
						expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(0);
					});
				}

				for (const validValue of TEST_CASE.validMappedValues ?? []) {
					test(`${getTestName(validValue[0])} reads as ${getTestName(validValue[1])}`, () => {
						setup(TEST_CASE);

						const ipfSignalSetSpy = spyOn(ipf.computedSignal, 'set');
						const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

						// load the input field
						loadIPF();

						setCacheExternally({ [TEST_PROP]: validValue[0] });

						// check that the input field value represents the value of the bound property in the front-matter cache
						expect(ipf.getValue()).toEqual(validValue[1]);
						// check that the value of the IPF has only been set once
						expect(ipfSignalSetSpy).toHaveBeenCalledTimes(2);
						// check that the input field did not update the metadata manager
						expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(0);
					});
				}
			});

			describe('should update to default value if front-matter value is invalid for that IPF', () => {
				for (const invalidValue of TEST_CASE.invalidValues ?? []) {
					test(getTestName(invalidValue), () => {
						setup(TEST_CASE);

						const ipfSignalSetSpy = spyOn(ipf.computedSignal, 'set');
						const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

						// load the input field
						loadIPF();

						setCacheExternally({ [TEST_PROP]: invalidValue });

						// check that the input field value is the default value of the IPF, since the front-matter value is invalid
						expect(ipf.getValue()).toEqual(ipf.getDefaultValue());
						// check that the value of the IPF has only been set once
						expect(ipfSignalSetSpy).toHaveBeenCalledTimes(2);
						// check that the input field did not update the metadata manager
						expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(0);
					});
				}
			});
		});

		describe('internal update behaviour', () => {
			describe('should update metadata manager exactly once when user updates input field', () => {
				for (const validValue of TEST_CASE.validValues ?? []) {
					test(getTestName(validValue), () => {
						setup(TEST_CASE);

						const ipfSignalSetSpy = spyOn(ipf.computedSignal, 'set');
						const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

						// load the input field
						loadIPF();

						// emulate user updating the input field
						ipf.setValue(validValue as never);

						// check that the input field value has actually updated
						expect(ipf.getValue()).toEqual(validValue);
						// check that the metadata manager was updated
						expect(getCacheMetadata()?.[TEST_PROP]).toEqual(validValue);
						// check that the value of the IPF has only been set twice, once on load and once on user update
						expect(ipfSignalSetSpy).toHaveBeenCalledTimes(2);
						// check that the input field did not update the metadata manager
						expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(1);
					});
				}
			});
		});

		describe('internal external update interaction behaviour', () => {
			describe('should not update on external update right after internal update', () => {
				const valueStream1 = Stream.of(TEST_CASE.validValues ?? []);
				const valueStream2 = Stream.ofCycle(valueStream1).skip(1);

				for (const [validValue, otherValidValue] of multi.zip(valueStream1, valueStream2)) {
					test(getTestName(validValue), () => {
						setup(TEST_CASE);

						const ipfSignalSetSpy = spyOn(ipf.computedSignal, 'set');
						const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

						// load the input field
						loadIPF();

						// emulate user updating the input field
						ipf.setValue(validValue as never);

						setCacheExternally({ [TEST_PROP]: otherValidValue });

						// make sure the values are not the same, otherwise the test is pointless
						expect(validValue).not.toEqual(otherValidValue);

						// check that the input field value was not updated by the external update
						expect(ipf.getValue()).toEqual(validValue as any);
						// check that the metadata manager was not updated by the external update
						expect(getCacheMetadata()?.[TEST_PROP]).toEqual(validValue);
						// check that the value of the IPF has only been set twice, once on load and once on user update
						expect(ipfSignalSetSpy).toHaveBeenCalledTimes(2);
						// check that the input field did not update the metadata manager
						expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(1);
					});
				}
			});

			describe('should update on external update after some update cycles after internal update', () => {
				const valueStream1 = Stream.of(TEST_CASE.validValues ?? []);
				const valueStream2 = Stream.ofCycle(valueStream1).skip(1);

				for (const [validValue, otherValidValue] of multi.zip(valueStream1, valueStream2)) {
					test(getTestName(validValue), () => {
						setup(TEST_CASE);

						const ipfSignalSetSpy = spyOn(ipf.computedSignal, 'set');
						const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

						// load the input field
						loadIPF();

						// emulate user updating the input field
						ipf.setValue(otherValidValue as never);

						for (let i = 0; i < METADATA_CACHE_UPDATE_CYCLE_THRESHOLD; i++) {
							updateMetadataManager();
						}

						setCacheExternally({ [TEST_PROP]: validValue });

						// make sure the values are not the same, otherwise the test is pointless
						expect(validValue).not.toEqual(otherValidValue);

						// check that the input field value was not updated by the external update
						expect(ipf.getValue()).toEqual(validValue as any);
						// check that the metadata manager was not updated by the external update
						expect(getCacheMetadata()?.[TEST_PROP]).toEqual(validValue);
						// check that the value of the IPF has only been set twice, once on load and once on user update
						expect(ipfSignalSetSpy).toHaveBeenCalledTimes(3);
						// check that the input field did not update the metadata manager
						expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(1);
					});
				}
			});

			describe('should update on internal update right after external update', () => {
				const valueStream1 = Stream.of(TEST_CASE.validValues ?? []);
				const valueStream2 = Stream.ofCycle(valueStream1).skip(1);

				for (const [validValue, otherValidValue] of multi.zip(valueStream1, valueStream2)) {
					test(getTestName(validValue), () => {
						setup(TEST_CASE);

						const ipfSignalSetSpy = spyOn(ipf.computedSignal, 'set');
						const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

						// load the input field
						loadIPF();

						setCacheExternally({ [TEST_PROP]: otherValidValue });

						// emulate user updating the input field
						ipf.setValue(validValue as never);

						// make sure the values are not the same, otherwise the test is pointless
						expect(validValue).not.toEqual(otherValidValue);

						// check that the input field value was updated by the internal update
						expect(ipf.getValue()).toEqual(validValue as any);
						// check that the metadata manager was not updated by the external update
						expect(getCacheMetadata()?.[TEST_PROP]).toEqual(validValue);
						// check that the value of the IPF has only been set twice, once on load and once on user update
						expect(ipfSignalSetSpy).toHaveBeenCalledTimes(3);
						// check that the input field did not update the metadata manager
						expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(1);
					});
				}
			});
		});

		describe('multiple IFP interactions', () => {
			/*
			 * TODO
			 *  - test that all input fields bound to the same property update on external update - done
			 *  - test that all input fields bound to the same property update on internal update - done
			 *  - test that all input fields bound to the same property load the same values - done
			 *  - test that input fields bound to different properties do not update each other
			 */

			describe('load behaviour', () => {
				describe('should load with front-matter value if front-matter value is valid for that IPF', () => {
					for (const validValue of TEST_CASE.validValues ?? []) {
						test(getTestName(validValue), () => {
							setupTwoIPFs(TEST_CASE);
							// add some metadata to the test file
							createInitialCache({ [TEST_PROP]: validValue });

							const ipf1SignalSetSpy = spyOn(ipf1.computedSignal, 'set');
							const ipf2SignalSetSpy = spyOn(ipf2.computedSignal, 'set');
							const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

							// load the input field
							loadIPF1();
							loadIPF2();

							// check that the input field value is the value of the bound property in the front-matter cache
							expect(ipf1.getValue()).toEqual(validValue);
							expect(ipf2.getValue()).toEqual(validValue);
							// check that the value of the IPF has only been set once
							expect(ipf1SignalSetSpy).toHaveBeenCalledTimes(1);
							expect(ipf2SignalSetSpy).toHaveBeenCalledTimes(1);
							// check that the input field did not update the metadata manager
							expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(0);
						});
					}

					for (const validValue of TEST_CASE.validMappedValues ?? []) {
						test(`${getTestName(validValue[0])} reads as ${getTestName(validValue[1])}`, () => {
							setupTwoIPFs(TEST_CASE);
							// add some metadata to the test file
							createInitialCache({ [TEST_PROP]: validValue[0] });

							const ipf1SignalSetSpy = spyOn(ipf1.computedSignal, 'set');
							const ipf2SignalSetSpy = spyOn(ipf2.computedSignal, 'set');
							const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

							// load the input field
							loadIPF1();
							loadIPF2();

							// check that the input field value represents the value of the bound property in the front-matter cache
							expect(ipf1.getValue()).toEqual(validValue[1]);
							expect(ipf2.getValue()).toEqual(validValue[1]);
							// check that the value of the IPF has only been set once
							expect(ipf1SignalSetSpy).toHaveBeenCalledTimes(1);
							expect(ipf2SignalSetSpy).toHaveBeenCalledTimes(1);
							// check that the input field did not update the metadata manager
							expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(0);
						});
					}
				});

				describe('should load with default value if front-matter value is invalid for that IPF', () => {
					for (const invalidValue of TEST_CASE.invalidValues ?? []) {
						test(getTestName(invalidValue), () => {
							setupTwoIPFs(TEST_CASE);
							// add some metadata to the test file
							createInitialCache({ [TEST_PROP]: invalidValue });

							const ipf1SignalSetSpy = spyOn(ipf1.computedSignal, 'set');
							const ipf2SignalSetSpy = spyOn(ipf2.computedSignal, 'set');
							const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

							// load the input field
							loadIPF1();
							loadIPF2();

							// check that the input field value is the default value of the IPF, since the front-matter value is invalid
							expect(ipf1.getValue()).toEqual(ipf1.getDefaultValue());
							expect(ipf2.getValue()).toEqual(ipf2.getDefaultValue());
							// check that the value of the IPF has only been set once
							expect(ipf1SignalSetSpy).toHaveBeenCalledTimes(1);
							expect(ipf2SignalSetSpy).toHaveBeenCalledTimes(1);
							// check that the input field did not update the metadata manager
							expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(0);
						});
					}
				});

				test('should load with default value when front-matter field not present', () => {
					setupTwoIPFs(TEST_CASE);

					const ipf1SignalSetSpy = spyOn(ipf1.computedSignal, 'set');
					const ipf2SignalSetSpy = spyOn(ipf2.computedSignal, 'set');
					const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

					// load the input field without any metadata being set
					loadIPF1();
					loadIPF2();

					// check that the input field value is the default value
					expect(ipf1.getValue()).toEqual(ipf1.getDefaultValue());
					expect(ipf2.getValue()).toEqual(ipf2.getDefaultValue());
					// check that the value of the IPF has only been set once
					expect(ipf1SignalSetSpy).toHaveBeenCalledTimes(1);
					expect(ipf2SignalSetSpy).toHaveBeenCalledTimes(1);
					// check that the input field did not update the metadata manager
					expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(0);
				});
			});

			describe('internal update behaviour', () => {
				describe('should update metadata manager exactly once when user updates input field', () => {
					for (const validValue of TEST_CASE.validValues ?? []) {
						test(getTestName(validValue), () => {
							setupTwoIPFs(TEST_CASE);

							const ipf1SignalSetSpy = spyOn(ipf1.computedSignal, 'set');
							const ipf2SignalSetSpy = spyOn(ipf2.computedSignal, 'set');
							const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

							// load the input field
							loadIPF1();
							loadIPF2();

							// emulate user updating the input field
							ipf1.setValue(validValue as never);

							// check that the input field value has actually updated
							expect(ipf1.getValue()).toEqual(validValue);
							expect(ipf2.getValue()).toEqual(validValue);
							// check that the metadata manager was updated
							expect(getCacheMetadata()?.[TEST_PROP]).toEqual(validValue);
							// check that the value of the IPF has only been set twice, once on load and once on user update
							expect(ipf1SignalSetSpy).toHaveBeenCalledTimes(2);
							expect(ipf2SignalSetSpy).toHaveBeenCalledTimes(2);
							// check that the input field did not update the metadata manager
							expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(1);
						});
					}
				});
			});

			describe('internal external update interaction behaviour', () => {
				describe('should not update on external update right after internal update', () => {
					const valueStream1 = Stream.of(TEST_CASE.validValues ?? []);
					const valueStream2 = Stream.ofCycle(valueStream1).skip(1);

					for (const [validValue, otherValidValue] of multi.zip(valueStream1, valueStream2)) {
						test(getTestName(validValue), () => {
							setupTwoIPFs(TEST_CASE);

							const ipf1SignalSetSpy = spyOn(ipf1.computedSignal, 'set');
							const ipf2SignalSetSpy = spyOn(ipf2.computedSignal, 'set');
							const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

							// load the input field
							loadIPF1();
							loadIPF2();

							// emulate user updating the input field
							ipf1.setValue(validValue as never);

							setCacheExternally({ [TEST_PROP]: otherValidValue });

							// make sure the values are not the same, otherwise the test is pointless
							expect(validValue).not.toEqual(otherValidValue);

							// check that the input field value was not updated by the external update
							expect(ipf1.getValue()).toEqual(validValue as any);
							expect(ipf2.getValue()).toEqual(validValue as any);
							// check that the metadata manager was not updated by the external update
							expect(getCacheMetadata()?.[TEST_PROP]).toEqual(validValue);
							// check that the value of the IPF has only been set twice, once on load and once on user update
							expect(ipf1SignalSetSpy).toHaveBeenCalledTimes(2);
							expect(ipf2SignalSetSpy).toHaveBeenCalledTimes(2);
							// check that the input field did not update the metadata manager
							expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(1);
						});
					}
				});

				describe('should update on external update after some update cycles after internal update', () => {
					const valueStream1 = Stream.of(TEST_CASE.validValues ?? []);
					const valueStream2 = Stream.ofCycle(valueStream1).skip(1);

					for (const [validValue, otherValidValue] of multi.zip(valueStream1, valueStream2)) {
						test(getTestName(validValue), () => {
							setupTwoIPFs(TEST_CASE);

							const ipf1SignalSetSpy = spyOn(ipf1.computedSignal, 'set');
							const ipf2SignalSetSpy = spyOn(ipf2.computedSignal, 'set');
							const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

							// load the input field
							loadIPF1();
							loadIPF2();

							// emulate user updating the input field
							ipf1.setValue(otherValidValue as never);

							for (let i = 0; i < METADATA_CACHE_UPDATE_CYCLE_THRESHOLD; i++) {
								updateMetadataManager();
							}

							setCacheExternally({ [TEST_PROP]: validValue });

							// make sure the values are not the same, otherwise the test is pointless
							expect(validValue).not.toEqual(otherValidValue);

							// check that the input field value was not updated by the external update
							expect(ipf1.getValue()).toEqual(validValue as any);
							expect(ipf2.getValue()).toEqual(validValue as any);
							// check that the metadata manager was not updated by the external update
							expect(getCacheMetadata()?.[TEST_PROP]).toEqual(validValue);
							// check that the value of the IPF has only been set twice, once on load and once on user update
							expect(ipf1SignalSetSpy).toHaveBeenCalledTimes(3);
							expect(ipf2SignalSetSpy).toHaveBeenCalledTimes(3);
							// check that the input field did not update the metadata manager
							expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(1);
						});
					}
				});

				describe('should update on internal update right after external update', () => {
					const valueStream1 = Stream.of(TEST_CASE.validValues ?? []);
					const valueStream2 = Stream.ofCycle(valueStream1).skip(1);

					for (const [validValue, otherValidValue] of multi.zip(valueStream1, valueStream2)) {
						test(getTestName(validValue), () => {
							setupTwoIPFs(TEST_CASE);

							const ipf1SignalSetSpy = spyOn(ipf1.computedSignal, 'set');
							const ipf2SignalSetSpy = spyOn(ipf2.computedSignal, 'set');
							const metadataManagerInternalUpdateSpy = spyOn(testPlugin.metadataManager, 'updateCache');

							// load the input field
							loadIPF1();
							loadIPF2();

							setCacheExternally({ [TEST_PROP]: otherValidValue });

							// emulate user updating the input field
							ipf1.setValue(validValue as never);

							// make sure the values are not the same, otherwise the test is pointless
							expect(validValue).not.toEqual(otherValidValue);

							// check that the input field value was updated by the internal update
							expect(ipf1.getValue()).toEqual(validValue as any);
							expect(ipf2.getValue()).toEqual(validValue as any);
							// check that the metadata manager was not updated by the external update
							expect(getCacheMetadata()?.[TEST_PROP]).toEqual(validValue);
							// check that the value of the IPF has only been set twice, once on load and once on user update
							expect(ipf1SignalSetSpy).toHaveBeenCalledTimes(3);
							expect(ipf2SignalSetSpy).toHaveBeenCalledTimes(3);
							// check that the input field did not update the metadata manager
							expect(metadataManagerInternalUpdateSpy).toHaveBeenCalledTimes(1);
						});
					}
				});
			});
		});
	}

	for (const IPF_TEST of TEST_CONFIG) {
		describe(`${IPF_TEST.type}`, () => {
			for (const TEST_CASE of IPF_TEST.testCases) {
				describe(TEST_CASE.declaration, () => {
					runTestCase(IPF_TEST, TEST_CASE);
				});
			}
		});
	}
});
