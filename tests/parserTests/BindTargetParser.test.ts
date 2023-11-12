import { describe, test, expect } from 'bun:test';
import { BindTargetDeclaration } from '../../src/parsers/inputFieldParser/InputFieldDeclaration';
import { TestPlugin } from './mocks/TestAPI';
import { BindTargetScope } from '../../src/metadata/BindTargetScope';

const plugin = new TestPlugin();
const parser = plugin.api.bindTargetParser;

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
	filePath: 'scope_test_file',
	metadataPath: ['scope_test_metadata'],
	boundToLocalScope: false,
	listenToChildren: false,
};

const localScope = new BindTargetScope(localScopeBindTarget);

interface BindTargetCombination {
	filePath: string | undefined;
	metadataPath: string[];
	metadataPathString: string;
}

function generateValidBindTargets(): BindTargetCombination[] {
	const testCases: BindTargetCombination[] = [];
	for (const validBindTargetFile of validBindTargetFiles) {
		for (const validBindTargetPath of validBindTargetPaths) {
			testCases.push({
				filePath: validBindTargetFile,
				metadataPathString: validBindTargetPath[0],
				metadataPath: validBindTargetPath[1],
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
					filePath: undefined,
					metadataPath: combination.metadataPath,
					listenToChildren: false,
					boundToLocalScope: false,
				},
			},
			local: {
				str: localStr,
				expected: {
					filePath: localScopeBindTarget.filePath,
					metadataPath: localScopeBindTarget.metadataPath.concat(combination.metadataPath),
					listenToChildren: false,
					boundToLocalScope: true,
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
					filePath: combination.filePath,
					metadataPath: combination.metadataPath,
					listenToChildren: false,
					boundToLocalScope: false,
				},
			},
			local: {
				str: localStr,
				expected: {
					filePath: localScopeBindTarget.filePath,
					metadataPath: localScopeBindTarget.metadataPath.concat(combination.metadataPath),
					listenToChildren: false,
					boundToLocalScope: true,
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
				expect(parser.parseAndValidateBindTarget(testCase.normal.str)).toEqual(testCase.normal.expected);
			});

			test(testCase.local.str, () => {
				expect(parser.parseAndValidateBindTarget(testCase.local.str, localScope)).toEqual(testCase.local.expected);
			});
		}
	});
});
