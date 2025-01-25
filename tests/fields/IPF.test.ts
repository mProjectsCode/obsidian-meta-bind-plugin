import { beforeEach, describe, expect, test } from 'bun:test';
import { Stream, multi } from 'itertools-ts/es';
import { InputFieldType } from 'packages/core/src/config/FieldConfigs';
import { stringifyLiteral } from 'packages/core/src/utils/Literal';
import { DEFAULT_VALUE_INDICATOR, TestPlugin } from 'tests/__mocks__/TestPlugin';

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
				validValues: STANDARD_OPTION_VALUES_ARRAY,
				validMappedValues: [
					[TEST_VALUES.STRING, [TEST_VALUES.STRING]],
					[TEST_VALUES.EMPTY_STRING, [TEST_VALUES.EMPTY_STRING]],
				],
				invalidValues: [TEST_VALUES.NULL, TEST_VALUES.UNDEFINED, TEST_VALUES.OBJECT],
			},
		],
	},
	{
		type: InputFieldType.DATE_PICKER,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.DATE_PICKER}:${TEST_PROP}]`,
				validValues: ['2021-01-01', '2021-01-02', '2021-01-03', TEST_VALUES.NULL],
				invalidValues: [
					TEST_VALUES.UNDEFINED,
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
					[TEST_VALUES.STRING, [TEST_VALUES.STRING]],
					[TEST_VALUES.EMPTY_STRING, [TEST_VALUES.EMPTY_STRING]],
				],
				invalidValues: [TEST_VALUES.NULL, TEST_VALUES.UNDEFINED, TEST_VALUES.OBJECT],
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
					[TEST_VALUES.STRING, [TEST_VALUES.STRING]],
					[TEST_VALUES.EMPTY_STRING, [TEST_VALUES.EMPTY_STRING]],
				],
				invalidValues: [TEST_VALUES.NULL, TEST_VALUES.UNDEFINED, TEST_VALUES.OBJECT],
			},
		],
	},
	{
		type: InputFieldType.DATE,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.DATE}:${TEST_PROP}]`,
				validValues: [TEST_VALUES.EMPTY_STRING, TEST_VALUES.STRING],
				validMappedValues: [
					[TEST_VALUES.POSITIVE_INT, stringifyLiteral(TEST_VALUES.POSITIVE_INT)],
					[TEST_VALUES.NEGATIVE_INT, stringifyLiteral(TEST_VALUES.NEGATIVE_INT)],
					[TEST_VALUES.POSITIVE_FLOAT, stringifyLiteral(TEST_VALUES.POSITIVE_FLOAT)],
					[TEST_VALUES.NEGATIVE_FLOAT, stringifyLiteral(TEST_VALUES.NEGATIVE_FLOAT)],
					[TEST_VALUES.TRUE, stringifyLiteral(TEST_VALUES.TRUE)],
					[TEST_VALUES.FALSE, stringifyLiteral(TEST_VALUES.FALSE)],
					[TEST_VALUES.NULL, ''],
				],
				invalidValues: [TEST_VALUES.UNDEFINED, TEST_VALUES.OBJECT, TEST_VALUES.ARRAY],
			},
		],
	},
	{
		type: InputFieldType.TIME,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.TIME}:${TEST_PROP}]`,
				validValues: [TEST_VALUES.EMPTY_STRING, TEST_VALUES.STRING],
				validMappedValues: [
					[TEST_VALUES.POSITIVE_INT, stringifyLiteral(TEST_VALUES.POSITIVE_INT)],
					[TEST_VALUES.NEGATIVE_INT, stringifyLiteral(TEST_VALUES.NEGATIVE_INT)],
					[TEST_VALUES.POSITIVE_FLOAT, stringifyLiteral(TEST_VALUES.POSITIVE_FLOAT)],
					[TEST_VALUES.NEGATIVE_FLOAT, stringifyLiteral(TEST_VALUES.NEGATIVE_FLOAT)],
					[TEST_VALUES.TRUE, stringifyLiteral(TEST_VALUES.TRUE)],
					[TEST_VALUES.FALSE, stringifyLiteral(TEST_VALUES.FALSE)],
					[TEST_VALUES.NULL, ''],
				],
				invalidValues: [TEST_VALUES.UNDEFINED, TEST_VALUES.OBJECT, TEST_VALUES.ARRAY],
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
					[TEST_VALUES.STRING, [TEST_VALUES.STRING]],
					[TEST_VALUES.EMPTY_STRING, [TEST_VALUES.EMPTY_STRING]],
				],
				invalidValues: [TEST_VALUES.NULL, TEST_VALUES.UNDEFINED, TEST_VALUES.OBJECT],
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
					[TEST_VALUES.STRING, [TEST_VALUES.STRING]],
					[TEST_VALUES.EMPTY_STRING, [TEST_VALUES.EMPTY_STRING]],
				],
				invalidValues: [TEST_VALUES.NULL, TEST_VALUES.UNDEFINED, TEST_VALUES.OBJECT],
			},
		],
	},
	{
		type: InputFieldType.INLINE_LIST_SUGGESTER,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.INLINE_LIST_SUGGESTER}:${TEST_PROP}]`,
				validValues: STANDARD_OPTION_VALUES_ARRAY,
				validMappedValues: [
					[TEST_VALUES.STRING, [TEST_VALUES.STRING]],
					[TEST_VALUES.EMPTY_STRING, [TEST_VALUES.EMPTY_STRING]],
				],
				invalidValues: [TEST_VALUES.NULL, TEST_VALUES.UNDEFINED, TEST_VALUES.OBJECT],
			},
		],
	},
	{
		type: InputFieldType.DATE_TIME,
		testCases: [
			{
				declaration: `INPUT[${InputFieldType.DATE_TIME}:${TEST_PROP}]`,
				validValues: [TEST_VALUES.EMPTY_STRING, TEST_VALUES.STRING],
				validMappedValues: [
					[TEST_VALUES.POSITIVE_INT, stringifyLiteral(TEST_VALUES.POSITIVE_INT)],
					[TEST_VALUES.NEGATIVE_INT, stringifyLiteral(TEST_VALUES.NEGATIVE_INT)],
					[TEST_VALUES.POSITIVE_FLOAT, stringifyLiteral(TEST_VALUES.POSITIVE_FLOAT)],
					[TEST_VALUES.NEGATIVE_FLOAT, stringifyLiteral(TEST_VALUES.NEGATIVE_FLOAT)],
					[TEST_VALUES.TRUE, stringifyLiteral(TEST_VALUES.TRUE)],
					[TEST_VALUES.FALSE, stringifyLiteral(TEST_VALUES.FALSE)],
					[TEST_VALUES.NULL, ''],
				],
				invalidValues: [TEST_VALUES.UNDEFINED, TEST_VALUES.OBJECT, TEST_VALUES.ARRAY],
			},
		],
	},
];

function getTestName(value: any): string {
	return JSON.stringify(value) ?? 'undefined';
}

describe('IPF', () => {
	let testPlugin: TestPlugin;

	function runTestCase(TEST_CONFIG: IPFTest, TEST_CASE: IPFTestCase): void {
		// NOTE: all signal spys have a -1 to account for the initial signal set on mount

		beforeEach(() => {
			testPlugin = new TestPlugin();
		});

		describe('load behavior', () => {
			describe('should load with front-matter value if front-matter value is valid for that IPF', () => {
				for (const validValue of TEST_CASE.validValues ?? []) {
					test(getTestName(validValue), () => {
						testPlugin.addTestInputField(TEST_CASE.declaration);

						testPlugin.initializeTest();
						testPlugin.createInitialCache({ [TEST_PROP]: validValue });
						testPlugin.initializeAllTestInputFields();

						// check that the input field value is the value of the bound property in the front-matter cache
						testPlugin.expectAllTestInputFieldValuesToEqual([validValue]);
						// check that the value of the IPF has not been altered
						testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([0]);
						// check that the input field did not update the metadata manager
						testPlugin.expectMetadataManagerToHaveUpdatedTimes(0);
					});
				}

				for (const validValue of TEST_CASE.validMappedValues ?? []) {
					test(`${getTestName(validValue[0])} reads as ${getTestName(validValue[1])}`, () => {
						testPlugin.addTestInputField(TEST_CASE.declaration);

						testPlugin.initializeTest();
						testPlugin.createInitialCache({ [TEST_PROP]: validValue[0] });
						testPlugin.initializeAllTestInputFields();

						// check that the input field value represents the value of the bound property in the front-matter cache
						testPlugin.expectAllTestInputFieldValuesToEqual([validValue[1]]);
						// check that the value of the IPF has not been altered
						testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([0]);
						// check that the input field did not update the metadata manager
						testPlugin.expectMetadataManagerToHaveUpdatedTimes(0);
					});
				}
			});

			describe('should load with default value if front-matter value is invalid for that IPF', () => {
				for (const invalidValue of TEST_CASE.invalidValues ?? []) {
					test(getTestName(invalidValue), () => {
						testPlugin.addTestInputField(TEST_CASE.declaration);

						testPlugin.initializeTest();
						testPlugin.createInitialCache({ [TEST_PROP]: invalidValue });
						testPlugin.initializeAllTestInputFields();

						// check that the input field value is the default value of the IPF, since the front-matter value is invalid
						testPlugin.expectAllTestInputFieldValuesToEqual([DEFAULT_VALUE_INDICATOR]);
						// check that the value of the IPF has not been altered
						testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([0]);
						// check that the input field did not update the metadata manager
						testPlugin.expectMetadataManagerToHaveUpdatedTimes(0);
					});
				}
			});

			test('should load with default value when front-matter field not present', () => {
				testPlugin.addTestInputField(TEST_CASE.declaration);

				testPlugin.initializeTest();
				testPlugin.initializeAllTestInputFields();

				// check that the input field value is the default value
				testPlugin.expectAllTestInputFieldValuesToEqual([DEFAULT_VALUE_INDICATOR]);
				// check that the value of the IPF has not been altered
				testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([0]);
				// check that the input field did not update the metadata manager
				testPlugin.expectMetadataManagerToHaveUpdatedTimes(0);
			});
		});

		describe('external update behaviour', () => {
			describe('should update to front-matter value if front-matter value is valid for that IPF', () => {
				for (const validValue of TEST_CASE.validValues ?? []) {
					test(getTestName(validValue), () => {
						testPlugin.addTestInputField(TEST_CASE.declaration);

						testPlugin.initializeTest();
						testPlugin.initializeAllTestInputFields();

						testPlugin.setCacheExternally({ [TEST_PROP]: validValue });

						// check that the input field value is the value of the bound property in the front-matter cache
						testPlugin.expectAllTestInputFieldValuesToEqual([validValue]);
						// check that the value of the IPF has only been set once
						testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([1]);
						// check that the input field did not update the metadata manager
						testPlugin.expectMetadataManagerToHaveUpdatedTimes(0);
					});
				}

				for (const validValue of TEST_CASE.validMappedValues ?? []) {
					test(`${getTestName(validValue[0])} reads as ${getTestName(validValue[1])}`, () => {
						testPlugin.addTestInputField(TEST_CASE.declaration);

						testPlugin.initializeTest();
						testPlugin.initializeAllTestInputFields();

						testPlugin.setCacheExternally({ [TEST_PROP]: validValue[0] });

						// check that the input field value is the value of the bound property in the front-matter cache
						testPlugin.expectAllTestInputFieldValuesToEqual([validValue[1]]);
						// check that the value of the IPF has only been set once
						testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([1]);
						// check that the input field did not update the metadata manager
						testPlugin.expectMetadataManagerToHaveUpdatedTimes(0);
					});
				}
			});

			describe('should update to default value if front-matter value is invalid for that IPF', () => {
				for (const invalidValue of TEST_CASE.invalidValues ?? []) {
					test(getTestName(invalidValue), () => {
						testPlugin.addTestInputField(TEST_CASE.declaration);

						testPlugin.initializeTest();
						testPlugin.initializeAllTestInputFields();

						testPlugin.setCacheExternally({ [TEST_PROP]: invalidValue });

						// check that the input field value is the default value of the IPF, since the front-matter value is invalid
						testPlugin.expectAllTestInputFieldValuesToEqual([DEFAULT_VALUE_INDICATOR]);
						// check that the value of the IPF has only been set once or less, if the value is equal to the default value
						testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimesOrLess([1]);
						// check that the input field did not update the metadata manager
						testPlugin.expectMetadataManagerToHaveUpdatedTimes(0);
					});
				}
			});
		});

		describe('internal update behaviour', () => {
			describe('should update metadata manager exactly once when user updates input field', () => {
				for (const validValue of TEST_CASE.validValues ?? []) {
					test(getTestName(validValue), () => {
						const index = testPlugin.addTestInputField(TEST_CASE.declaration);

						testPlugin.initializeTest();
						testPlugin.initializeAllTestInputFields();

						// emulate user updating the input field
						testPlugin.setTestInputFieldValue(index, validValue);

						// check that the input field value has actually updated
						testPlugin.expectAllTestInputFieldValuesToEqual([validValue]);
						// check that the metadata manager was updated
						expect(testPlugin.getCacheMetadata()?.[TEST_PROP]).toEqual(validValue);
						// check that the value of the IPF has only been set once
						testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([1]);
						// check that the input field did update the metadata manager
						testPlugin.expectMetadataManagerToHaveUpdatedTimes(1);
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
						const index = testPlugin.addTestInputField(TEST_CASE.declaration);

						testPlugin.initializeTest();
						testPlugin.initializeAllTestInputFields();

						// emulate user updating the input field
						testPlugin.setTestInputFieldValue(index, validValue);

						// emulate external update
						testPlugin.setCacheExternally({ [TEST_PROP]: otherValidValue });

						// make sure the values are not the same, otherwise the test is pointless
						expect(validValue).not.toEqual(otherValidValue);

						// check that the input field value was not updated by the external update
						testPlugin.expectAllTestInputFieldValuesToEqual([validValue]);
						// check that the metadata manager was not updated by the external update
						expect(testPlugin.getCacheMetadata()?.[TEST_PROP]).toEqual(validValue);
						// check that the value of the IPF has only been set once
						testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([1]);
						// check that the input field did update the metadata manager
						testPlugin.expectMetadataManagerToHaveUpdatedTimes(1);
					});
				}
			});

			describe('should update on external update after some update cycles after internal update', () => {
				const valueStream1 = Stream.of(TEST_CASE.validValues ?? []);
				const valueStream2 = Stream.ofCycle(valueStream1).skip(1);

				for (const [validValue, otherValidValue] of multi.zip(valueStream1, valueStream2)) {
					test(getTestName(validValue), () => {
						const index = testPlugin.addTestInputField(TEST_CASE.declaration);

						testPlugin.initializeTest();
						testPlugin.initializeAllTestInputFields();

						// emulate user updating the input field
						testPlugin.setTestInputFieldValue(index, validValue);

						testPlugin.cycleMetadataManagerUntilThreshold();

						// emulate external update
						testPlugin.setCacheExternally({ [TEST_PROP]: otherValidValue });

						// make sure the values are not the same, otherwise the test is pointless
						expect(validValue).not.toEqual(otherValidValue);

						// check that the input field value was not updated by the external update
						testPlugin.expectAllTestInputFieldValuesToEqual([otherValidValue]);
						// check that the metadata manager was not updated by the external update
						expect(testPlugin.getCacheMetadata()?.[TEST_PROP]).toEqual(otherValidValue);
						// check that the value of the IPF has only been set twice, once on user input and once on external update
						testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([2]);
						// check that the input field did update the metadata manager
						testPlugin.expectMetadataManagerToHaveUpdatedTimes(1);
					});
				}
			});

			describe('should update on internal update right after external update', () => {
				const valueStream1 = Stream.of(TEST_CASE.validValues ?? []);
				const valueStream2 = Stream.ofCycle(valueStream1).skip(1);

				for (const [validValue, otherValidValue] of multi.zip(valueStream1, valueStream2)) {
					test(getTestName(validValue), () => {
						const index = testPlugin.addTestInputField(TEST_CASE.declaration);

						testPlugin.initializeTest();
						testPlugin.initializeAllTestInputFields();

						// emulate external update
						testPlugin.setCacheExternally({ [TEST_PROP]: validValue });

						// emulate user updating the input field
						testPlugin.setTestInputFieldValue(index, otherValidValue);

						// make sure the values are not the same, otherwise the test is pointless
						expect(validValue).not.toEqual(otherValidValue);

						// check that the input field value was not updated by the external update
						testPlugin.expectAllTestInputFieldValuesToEqual([otherValidValue]);
						// check that the metadata manager was not updated by the external update
						expect(testPlugin.getCacheMetadata()?.[TEST_PROP]).toEqual(otherValidValue);
						// check that the value of the IPF has only been set twice, once on external update and once on user input
						testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([2]);
						// check that the input field did update the metadata manager
						testPlugin.expectMetadataManagerToHaveUpdatedTimes(1);
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
							const index1 = testPlugin.addTestInputField(TEST_CASE.declaration);
							const index2 = testPlugin.addTestInputField(TEST_CASE.declaration);

							testPlugin.initializeTest();
							testPlugin.createInitialCache({ [TEST_PROP]: validValue });
							testPlugin.initializeAllTestInputFields();

							// check that the input field value is the value of the bound property in the front-matter cache
							testPlugin.expectAllTestInputFieldValuesToEqual([validValue, validValue]);
							// check that the value of the IPF has not been altered
							testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([0, 0]);
							// check that the input field did not update the metadata manager
							testPlugin.expectMetadataManagerToHaveUpdatedTimes(0);
						});
					}

					for (const validValue of TEST_CASE.validMappedValues ?? []) {
						test(`${getTestName(validValue[0])} reads as ${getTestName(validValue[1])}`, () => {
							const index1 = testPlugin.addTestInputField(TEST_CASE.declaration);
							const index2 = testPlugin.addTestInputField(TEST_CASE.declaration);

							testPlugin.initializeTest();
							testPlugin.createInitialCache({ [TEST_PROP]: validValue[0] });
							testPlugin.initializeAllTestInputFields();

							// check that the input field value is the mapped value of the bound property in the front-matter cache
							testPlugin.expectAllTestInputFieldValuesToEqual([validValue[1], validValue[1]]);
							// check that the value of the IPF has not been altered
							testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([0, 0]);
							// check that the input field did not update the metadata manager
							testPlugin.expectMetadataManagerToHaveUpdatedTimes(0);
						});
					}
				});

				describe('should load with default value if front-matter value is invalid for that IPF', () => {
					for (const invalidValue of TEST_CASE.invalidValues ?? []) {
						test(getTestName(invalidValue), () => {
							const index1 = testPlugin.addTestInputField(TEST_CASE.declaration);
							const index2 = testPlugin.addTestInputField(TEST_CASE.declaration);

							testPlugin.initializeTest();
							testPlugin.createInitialCache({ [TEST_PROP]: invalidValue });
							testPlugin.initializeAllTestInputFields();

							// check that the input field value is the default value of the IPF, since the front-matter value is invalid
							testPlugin.expectAllTestInputFieldValuesToEqual([
								DEFAULT_VALUE_INDICATOR,
								DEFAULT_VALUE_INDICATOR,
							]);
							// check that the value of the IPF has not been altered
							testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([0, 0]);
							// check that the input field did not update the metadata manager
							testPlugin.expectMetadataManagerToHaveUpdatedTimes(0);
						});
					}
				});

				test('should load with default value when front-matter field not present', () => {
					const index1 = testPlugin.addTestInputField(TEST_CASE.declaration);
					const index2 = testPlugin.addTestInputField(TEST_CASE.declaration);

					testPlugin.initializeTest();
					testPlugin.initializeAllTestInputFields();

					// check that the input field value is the default value of the IPF
					testPlugin.expectAllTestInputFieldValuesToEqual([DEFAULT_VALUE_INDICATOR, DEFAULT_VALUE_INDICATOR]);
					// check that the value of the IPF has not been altered
					testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([0, 0]);
					// check that the input field did not update the metadata manager
					testPlugin.expectMetadataManagerToHaveUpdatedTimes(0);
				});
			});

			describe('internal update behaviour', () => {
				describe('should update metadata manager exactly once when user updates input field', () => {
					for (const validValue of TEST_CASE.validValues ?? []) {
						test(getTestName(validValue), () => {
							const index1 = testPlugin.addTestInputField(TEST_CASE.declaration);
							const index2 = testPlugin.addTestInputField(TEST_CASE.declaration);

							testPlugin.initializeTest();
							testPlugin.initializeAllTestInputFields();

							// emulate user updating the input field
							testPlugin.setTestInputFieldValue(index1, validValue);

							// check that the input field value has actually updated
							testPlugin.expectAllTestInputFieldValuesToEqual([validValue, validValue]);
							// check that the metadata manager was updated
							expect(testPlugin.getCacheMetadata()?.[TEST_PROP]).toEqual(validValue);
							// check that the value of the IPF has only been set on user update
							testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([1, 1]);
							// check that the input field did update the metadata manager
							testPlugin.expectMetadataManagerToHaveUpdatedTimes(1);
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
							const index1 = testPlugin.addTestInputField(TEST_CASE.declaration);
							const index2 = testPlugin.addTestInputField(TEST_CASE.declaration);

							testPlugin.initializeTest();
							testPlugin.initializeAllTestInputFields();

							// emulate user updating the input field
							testPlugin.setTestInputFieldValue(index1, validValue);

							testPlugin.setCacheExternally({ [TEST_PROP]: otherValidValue });

							// make sure the values are not the same, otherwise the test is pointless
							expect(validValue).not.toEqual(otherValidValue);

							// check that the input field value was not updated by the external update
							testPlugin.expectAllTestInputFieldValuesToEqual([validValue, validValue]);
							// check that the metadata manager was not updated by the external update
							expect(testPlugin.getCacheMetadata()?.[TEST_PROP]).toEqual(validValue);
							// check that the value of the IPF has only been set on user update
							testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([1, 1]);
							// check that the input field did update the metadata manager
							testPlugin.expectMetadataManagerToHaveUpdatedTimes(1);
						});
					}
				});

				describe('should update on external update after some update cycles after internal update', () => {
					const valueStream1 = Stream.of(TEST_CASE.validValues ?? []);
					const valueStream2 = Stream.ofCycle(valueStream1).skip(1);

					for (const [validValue, otherValidValue] of multi.zip(valueStream1, valueStream2)) {
						test(getTestName(validValue), () => {
							const index1 = testPlugin.addTestInputField(TEST_CASE.declaration);
							const index2 = testPlugin.addTestInputField(TEST_CASE.declaration);

							testPlugin.initializeTest();
							testPlugin.initializeAllTestInputFields();

							// emulate user updating the input field
							testPlugin.setTestInputFieldValue(index1, validValue);

							testPlugin.cycleMetadataManagerUntilThreshold();

							testPlugin.setCacheExternally({ [TEST_PROP]: otherValidValue });

							// make sure the values are not the same, otherwise the test is pointless
							expect(validValue).not.toEqual(otherValidValue);

							// check that the input field value was updated by the external update
							testPlugin.expectAllTestInputFieldValuesToEqual([otherValidValue, otherValidValue]);
							// check that the metadata manager was updated by the external update
							expect(testPlugin.getCacheMetadata()?.[TEST_PROP]).toEqual(otherValidValue);
							// check that the value of the IPF has only been set twice, once on user update and once on external update
							testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([2, 2]);
							// check that the input field did update the metadata manager
							testPlugin.expectMetadataManagerToHaveUpdatedTimes(1);
						});
					}
				});

				describe('should update on internal update right after external update', () => {
					const valueStream1 = Stream.of(TEST_CASE.validValues ?? []);
					const valueStream2 = Stream.ofCycle(valueStream1).skip(1);

					for (const [validValue, otherValidValue] of multi.zip(valueStream1, valueStream2)) {
						test(getTestName(validValue), () => {
							const index1 = testPlugin.addTestInputField(TEST_CASE.declaration);
							const index2 = testPlugin.addTestInputField(TEST_CASE.declaration);

							testPlugin.initializeTest();
							testPlugin.initializeAllTestInputFields();

							testPlugin.setCacheExternally({ [TEST_PROP]: validValue });

							// emulate user updating the input field
							testPlugin.setTestInputFieldValue(index1, otherValidValue);

							// make sure the values are not the same, otherwise the test is pointless
							expect(validValue).not.toEqual(otherValidValue);

							// check that the input field value was updated by the internal update
							testPlugin.expectAllTestInputFieldValuesToEqual([otherValidValue, otherValidValue]);
							// check that the metadata manager was updated by the internal update
							expect(testPlugin.getCacheMetadata()?.[TEST_PROP]).toEqual(otherValidValue);
							// check that the value of the IPF has only been set twice, once on user update and once on external update
							testPlugin.expectAllTestInputFieldSpysToHaveBeenCalledTimes([2, 2]);
							// check that the input field did update the metadata manager
							testPlugin.expectMetadataManagerToHaveUpdatedTimes(1);
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
