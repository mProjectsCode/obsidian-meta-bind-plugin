import { describe, expect, test } from 'bun:test';
import { BindTargetScope } from '../../src/metadata/BindTargetScope';
import { parsePropPath } from '../../src/utils/prop/PropParser';
import { PropPath } from '../../src/utils/prop/PropPath';
import { TestPlugin } from '../__mocks__/TestPlugin';
import { BindTargetDeclaration, BindTargetStorageType } from '../../src/parsers/BindTargetDeclaration';

const plugin = new TestPlugin();
const parser = plugin.api.bindTargetParser;
const TEST_FILE = 'test.md';

const validBindTargetFiles = [
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

const validBindTargetPaths: [string, string[]][] = [
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
	filePath: string | undefined;
	metadataPath: PropPath;
	metadataPathString: string;
}

function generateValidBindTargets(): BindTargetCombination[] {
	const testCases: BindTargetCombination[] = [];
	for (const validBindTargetFile of validBindTargetFiles) {
		for (const validBindTargetPath of validBindTargetPaths) {
			testCases.push({
				filePath: validBindTargetFile,
				metadataPathString: validBindTargetPath[0],
				metadataPath: parsePropPath(validBindTargetPath[1]),
			});
		}
	}
	return testCases;
}

interface TestCasePart {
	str: string;
	expected: BindTargetDeclaration;
}

interface TestCase {
	normal: TestCasePart;
	local: TestCasePart;
}

function generateTestCase(combination: BindTargetCombination): TestCase {
	if (combination.filePath === undefined) {
		let localStr: string;
		if (combination.metadataPathString.startsWith('[')) {
			localStr = `^${combination.metadataPathString}`;
		} else {
			localStr = `^.${combination.metadataPathString}`;
		}

		return {
			normal: {
				str: combination.metadataPathString,
				expected: {
					storageType: BindTargetStorageType.FRONTMATTER,
					storagePath: TEST_FILE,
					storageProp: combination.metadataPath,
					listenToChildren: false,
				},
			},
			local: {
				str: localStr,
				expected: {
					storageType: localScopeBindTarget.storageType,
					storagePath: localScopeBindTarget.storagePath,
					storageProp: localScopeBindTarget.storageProp.concat(combination.metadataPath),
					listenToChildren: false,
				},
			},
		};
	} else {
		let localStr: string;
		if (combination.metadataPathString.startsWith('[')) {
			localStr = `${combination.filePath}#^${combination.metadataPathString}`;
		} else {
			localStr = `${combination.filePath}#^.${combination.metadataPathString}`;
		}

		return {
			normal: {
				str: `${combination.filePath}#${combination.metadataPathString}`,
				expected: {
					storageType: BindTargetStorageType.FRONTMATTER,
					storagePath: combination.filePath,
					storageProp: combination.metadataPath,
					listenToChildren: false,
				},
			},
			local: {
				str: localStr,
				expected: {
					storageType: localScopeBindTarget.storageType,
					storagePath: localScopeBindTarget.storagePath,
					storageProp: localScopeBindTarget.storageProp.concat(combination.metadataPath),
					listenToChildren: false,
				},
			},
		};
	}
}

describe('bind target parser', () => {
	describe('should succeed on valid bind target', () => {
		for (const bindTarget of generateValidBindTargets()) {
			const testCase = generateTestCase(bindTarget);

			test(testCase.normal.str, () => {
				// console.log(JSON.stringify(testCase.normal.expected, null, 2));
				// console.log(JSON.stringify(parser.parseAndValidateBindTarget(testCase.normal.str), null, 2));
				expect(parser.parseAndValidateBindTarget(testCase.normal.str, TEST_FILE)).toEqual(
					testCase.normal.expected,
				);
			});

			// test(testCase.local.str, () => {
			// 	expect(parser.parseAndValidateBindTarget(testCase.local.str, localScope)).toEqual(
			// 		testCase.local.expected,
			// 	);
			// });
		}
	});
});
