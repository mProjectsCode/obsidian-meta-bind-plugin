import { describe, expect, test } from 'bun:test';
import { set } from 'itertools-ts/es';
import { BindTargetScope } from '../../packages/core/src/metadata/BindTargetScope';
import {
	type BindTargetDeclaration,
	BindTargetStorageType,
} from '../../packages/core/src/parsers/bindTargetParser/BindTargetDeclaration';
import { parsePropPath } from '../../packages/core/src/utils/prop/PropParser';
import { PropPath } from '../../packages/core/src/utils/prop/PropPath';
import { TestPlugin } from '../__mocks__/TestPlugin';

const plugin = new TestPlugin();
const parser = plugin.api.bindTargetParser;
const TEST_FILE = 'test.md';

const validStorageTypes = [
	undefined,
	BindTargetStorageType.FRONTMATTER,
	BindTargetStorageType.MEMORY,
	BindTargetStorageType.GLOBAL_MEMORY,
	BindTargetStorageType.SCOPE,
];

const validStoragePaths = [
	undefined,
	'file',
	'testFile',
	'test_file',
	'test-file',
	'test file',
	'path/to/file',
	'something/in/japanese こんにちは',
	'this is/some-path/to_some_file/in chinese/你叫什么名字',
];

const validStorageProps: [string, string[]][] = [
	['test', ['test']],
	['["test"]', ['test']],
	['this["is"]', ['this', 'is']],
	['this["is"]["a"]', ['this', 'is', 'a']],
	['this["is"]["a"].path', ['this', 'is', 'a', 'path']],
	['["this"].is.a["path"]', ['this', 'is', 'a', 'path']],
	['[0]', ['0']],
	['test[0]', ['test', '0']],
	['test["foo"][1]', ['test', 'foo', '1']],
	['test["foo"][1].bar', ['test', 'foo', '1', 'bar']],
];

const localScopeBindTarget: BindTargetDeclaration = {
	storageType: BindTargetStorageType.FRONTMATTER,
	storagePath: 'scope.md',
	storageProp: parsePropPath(['scope_test_metadata']),
	listenToChildren: false,
};

const localScope = new BindTargetScope(localScopeBindTarget);

interface BindTargetCombination {
	storageType: BindTargetStorageType | undefined;
	storagePath: string | undefined;
	storageProp: PropPath;
	storagePropString: string;
}

function generateValidBindTargets(): BindTargetCombination[] {
	const testCases: BindTargetCombination[] = [];
	for (const [storageType, storagePath, storageProp] of set.cartesianProduct(
		validStorageTypes,
		validStoragePaths,
		validStorageProps,
	)) {
		if (
			(storageType === BindTargetStorageType.SCOPE || storageType === BindTargetStorageType.GLOBAL_MEMORY) &&
			storagePath !== undefined
		) {
			continue;
		}

		testCases.push({
			storageType: storageType,
			storagePath: storagePath,
			storagePropString: storageProp[0],
			storageProp: parsePropPath(storageProp[1]),
		});
	}
	return testCases;
}

interface TestCase {
	str: string;
	expected: BindTargetDeclaration;
}

function generateTestCase(combination: BindTargetCombination): TestCase {
	const hasStorageType = combination.storageType !== undefined;
	const hasStoragePath = combination.storagePath !== undefined;

	const storageTypePart = hasStorageType ? `${combination.storageType}^` : '';
	const storagePathPart = hasStoragePath ? `${combination.storagePath}#` : '';

	const combinedStr = storageTypePart + storagePathPart + combination.storagePropString;

	if (combination.storageType === BindTargetStorageType.SCOPE) {
		return {
			str: combinedStr,
			expected: {
				storageType: localScopeBindTarget.storageType,
				storagePath: localScopeBindTarget.storagePath,
				storageProp: localScopeBindTarget.storageProp.concat(combination.storageProp),
				listenToChildren: false,
			},
		};
	}
	if (combination.storageType === BindTargetStorageType.GLOBAL_MEMORY) {
		return {
			str: combinedStr,
			expected: {
				storageType: BindTargetStorageType.GLOBAL_MEMORY,
				storagePath: '',
				storageProp: combination.storageProp,
				listenToChildren: false,
			},
		};
	}

	return {
		str: combinedStr,
		expected: {
			storageType: hasStorageType
				? (combination.storageType as BindTargetStorageType)
				: BindTargetStorageType.FRONTMATTER,
			storagePath: hasStoragePath ? (combination.storagePath as string) : TEST_FILE,
			storageProp: combination.storageProp,
			listenToChildren: false,
		},
	};
}

describe('bind target parser', () => {
	describe('should succeed on valid bind target', () => {
		for (const bindTarget of generateValidBindTargets()) {
			const testCase = generateTestCase(bindTarget);

			test(testCase.str, () => {
				expect(parser.fromStringAndValidate(testCase.str, TEST_FILE, localScope)).toEqual(testCase.expected);

				// the syntax highlighting parser should not error
				expect(
					plugin.api.syntaxHighlighting.highlightBindTarget(testCase.str, false).parsingError,
				).toBeUndefined();
			});
		}
	});
});
