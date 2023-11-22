import { beforeEach, describe, expect, test } from 'bun:test';
import { TestPlugin } from '../../mocks/TestAPI';
import { InputFieldType, RenderChildType } from '../../../src/config/FieldConfigs';
import { TestIPFBase } from '../../mocks/TestIPFBase';
import { Metadata } from '../../../src/metadata/MetadataManagerCacheItem';
import { Signal } from '../../../src/utils/Signal';
import { getUUID } from '../../../src/utils/Utils';
import { parsePropPath } from '../../../src/utils/prop/PropParser';
import { InputField } from '../../../src/fields/inputFields/InputFieldFactory';

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
	declaration: string;
	exampleValues?: any[];
}

const STANDARD_OPTION_VALUES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const STANDARD_OPTION_ARGUMENTS = STANDARD_OPTION_VALUES.map(x => `option(${x})`).join(', ');
const STANDARD_OPTION_VALUES_ARRAY = [['a', 'b'], ['c', 'd', 'e'], ['f', 'g', 'h', 'i'], ['j']];

let TEST_CONFIG: IPFTest[] = [
	{
		type: InputFieldType.TOGGLE,
		declaration: `INPUT[${InputFieldType.TOGGLE}:${TEST_PROP}]`,
		exampleValues: [true, false],
	},
	{
		type: InputFieldType.SLIDER,
		declaration: `INPUT[${InputFieldType.SLIDER}:${TEST_PROP}]`,
		exampleValues: [0, 1, 2, 3, 4, 5],
	},
	{
		type: InputFieldType.TEXT,
		declaration: `INPUT[${InputFieldType.TEXT}:${TEST_PROP}]`,
		exampleValues: [TEST_VALUES.EMPTY_STRING, TEST_VALUES.STRING],
	},
	{
		type: InputFieldType.TEXT_AREA,
		declaration: `INPUT[${InputFieldType.TEXT_AREA}:${TEST_PROP}]`,
		exampleValues: [TEST_VALUES.EMPTY_STRING, TEST_VALUES.STRING],
	},
	{
		type: InputFieldType.SELECT,
		declaration: `INPUT[${InputFieldType.SELECT}(${STANDARD_OPTION_ARGUMENTS}):${TEST_PROP}]`,
		exampleValues: STANDARD_OPTION_VALUES,
	},
	{
		type: InputFieldType.MULTI_SELECT,
		declaration: `INPUT[${InputFieldType.MULTI_SELECT}(${STANDARD_OPTION_ARGUMENTS}):${TEST_PROP}]`,
		exampleValues: STANDARD_OPTION_VALUES_ARRAY,
	},
	{
		type: InputFieldType.DATE_PICKER,
		declaration: `INPUT[${InputFieldType.DATE_PICKER}:${TEST_PROP}]`,
		exampleValues: ['2021-01-01', '2021-01-02', '2021-01-03'],
	},
	{
		type: InputFieldType.NUMBER,
		declaration: `INPUT[${InputFieldType.NUMBER}:${TEST_PROP}]`,
		exampleValues: [0, 1, 2, 3, 4, 5],
	},
	{
		type: InputFieldType.SUGGESTER,
		declaration: `INPUT[${InputFieldType.SUGGESTER}(${STANDARD_OPTION_ARGUMENTS}):${TEST_PROP}]`,
		exampleValues: STANDARD_OPTION_VALUES,
	},
	{
		type: InputFieldType.EDITOR,
		declaration: `INPUT[${InputFieldType.EDITOR}:${TEST_PROP}]`,
		exampleValues: [TEST_VALUES.EMPTY_STRING, TEST_VALUES.STRING],
	},
	{
		type: InputFieldType.PROGRESS_BAR,
		declaration: `INPUT[${InputFieldType.PROGRESS_BAR}:${TEST_PROP}]`,
		exampleValues: [0, 1, 2, 3, 4, 5],
	},
	{
		type: InputFieldType.INLINE_SELECT,
		declaration: `INPUT[${InputFieldType.INLINE_SELECT}(${STANDARD_OPTION_ARGUMENTS}):${TEST_PROP}]`,
		exampleValues: STANDARD_OPTION_VALUES,
	},
	{
		type: InputFieldType.IMAGE_SUGGESTER,
		declaration: `INPUT[${InputFieldType.IMAGE_SUGGESTER}(${STANDARD_OPTION_ARGUMENTS}):${TEST_PROP}]`,
		// exampleValues: STANDARD_OPTION_VALUES, // TODO: fix image to uri app not found
	},
	{
		type: InputFieldType.LIST,
		declaration: `INPUT[${InputFieldType.LIST}:${TEST_PROP}]`,
		exampleValues: STANDARD_OPTION_VALUES_ARRAY,
	},
	{
		type: InputFieldType.LIST_SUGGESTER,
		declaration: `INPUT[${InputFieldType.LIST_SUGGESTER}(${STANDARD_OPTION_ARGUMENTS}):${TEST_PROP}]`,
		exampleValues: STANDARD_OPTION_VALUES_ARRAY,
	},
	{
		type: InputFieldType.DATE,
		declaration: `INPUT[${InputFieldType.DATE}:${TEST_PROP}]`,
		exampleValues: ['2021-01-01', '2021-01-02', '2021-01-03'],
	},
	{
		type: InputFieldType.TIME,
		declaration: `INPUT[${InputFieldType.TIME}:${TEST_PROP}]`,
		exampleValues: ['14:45', '05:03'],
	},
	{
		type: InputFieldType.INLINE_LIST_SUGGESTER,
		declaration: `INPUT[${InputFieldType.INLINE_LIST_SUGGESTER}(${STANDARD_OPTION_ARGUMENTS}):${TEST_PROP}]`,
		exampleValues: STANDARD_OPTION_VALUES_ARRAY,
	},
	{
		type: InputFieldType.INLINE_LIST,
		declaration: `INPUT[${InputFieldType.INLINE_LIST}:${TEST_PROP}]`,
		exampleValues: STANDARD_OPTION_VALUES_ARRAY,
	},
];

describe('IPF', () => {
	let testPlugin: TestPlugin;
	let ipfBase: TestIPFBase;
	let ipf: InputField;

	beforeEach(() => {});

	/**
	 * Set up the test by setting the initial metadata and loading the input field.
	 *
	 * @param testCase
	 * @param initialMetadata the initial metadata to set, will not set any metadata and will not create a cache item for the test file if undefined
	 */
	function setup(testCase: IPFTest, initialMetadata?: Record<string, unknown> | undefined): void {
		testPlugin = new TestPlugin();

		ipfBase = testPlugin.api.createInputFieldFromString(
			testCase.declaration,
			RenderChildType.BLOCK,
			TEST_FILE_PATH,
			document.body,
		);

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
		ipf = ipfBase.inputField as InputField;
	}

	for (const TEST_CASE of TEST_CONFIG) {
		describe(`${TEST_CASE.type} - ${TEST_CASE.declaration}`, () => {
			describe('load behaviour', () => {
				// this is also a test that the filter method does not modify the value
				describe('should load with front-matter value', () => {
					for (const exampleValue of TEST_CASE.exampleValues ?? []) {
						test(JSON.stringify(exampleValue), () => {
							// add some metadata to the test file and load the input field
							setup(TEST_CASE, { [TEST_PROP]: exampleValue });
							// check that the input field value is the value of the bound property in the front-matter cache
							expect(ipf.getValue()).toEqual(exampleValue);
						});
					}
				});

				test('should load with default value when front-matter field not present', () => {
					// load the input field without any metadata being set
					setup(TEST_CASE);
					// check that the input field value is the default value
					expect(ipf.getValue()).toEqual(ipf.getDefaultValue());
				});
			});
		});
	}
});
