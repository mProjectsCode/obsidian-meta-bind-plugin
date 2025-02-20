import { beforeEach, describe, expect, test } from 'bun:test';
import { type ButtonAction, ButtonActionType, ButtonClickType } from 'packages/core/src/config/ButtonConfig';
import { TestPlugin } from 'tests/__mocks__/TestPlugin';

let testPlugin: TestPlugin;
const testFilePath = 'test/file.md';
const defaultClick = {
	type: ButtonClickType.LEFT,
	shiftKey: false,
	ctrlKey: false,
	altKey: false,
};

async function simplifiedRunAction(action: ButtonAction): Promise<void> {
	await testPlugin.api.buttonActionRunner.runAction(
		undefined,
		action,
		testFilePath,
		{
			position: undefined,
			isInline: false,
			isInGroup: false,
		},
		defaultClick,
	);
}

const buttonActionTests: Record<ButtonActionType, () => void> = {
	[ButtonActionType.COMMAND]: () => {
		test('does not throw', () => {
			expect(async () => {
				await simplifiedRunAction({
					type: ButtonActionType.COMMAND,
					command: 'test',
				});
			}).not.toThrow();
		});
	},
	[ButtonActionType.JS]: () => {
		test('does not throw', () => {
			expect(async () => {
				await simplifiedRunAction({
					type: ButtonActionType.JS,
					file: 'someJSFile.js',
					args: {
						someArg: 'someValue',
					},
				});
			}).not.toThrow();
		});
	},
	[ButtonActionType.OPEN]: () => {
		test('does not throw', () => {
			expect(async () => {
				await simplifiedRunAction({
					type: ButtonActionType.OPEN,
					link: '[[test/otherFile.md]]',
					newTab: true,
				});
			}).not.toThrow();
		});
	},
	[ButtonActionType.INPUT]: () => {
		test('does not throw', () => {
			expect(async () => {
				await simplifiedRunAction({
					type: ButtonActionType.INPUT,
					str: 'some string',
				});
			}).not.toThrow();
		});
	},
	[ButtonActionType.SLEEP]: () => {
		test('does not throw', () => {
			expect(async () => {
				await simplifiedRunAction({
					type: ButtonActionType.SLEEP,
					ms: 100,
				});
			}).not.toThrow();
		});
	},
	[ButtonActionType.TEMPLATER_CREATE_NOTE]: () => {
		test('does not throw', () => {
			expect(async () => {
				await simplifiedRunAction({
					type: ButtonActionType.TEMPLATER_CREATE_NOTE,
					templateFile: 'template/file.md',
					folderPath: 'folderPath',
					fileName: 'fileName',
					openNote: false,
				});
			}).not.toThrow();
		});
	},
	[ButtonActionType.UPDATE_METADATA]: () => {
		test('does not throw', () => {
			expect(async () => {
				await simplifiedRunAction({
					type: ButtonActionType.UPDATE_METADATA,
					bindTarget: 'testProp',
					evaluate: false,
					value: 'testValue',
				});
			}).not.toThrow();
		});

		test('updates metadata', async () => {
			await simplifiedRunAction({
				type: ButtonActionType.UPDATE_METADATA,
				bindTarget: 'testProp',
				evaluate: false,
				value: 'testValue',
			});

			expect(testPlugin.getCacheMetadata(testFilePath)?.['testProp']).toBe('testValue');
		});
	},
	[ButtonActionType.CREATE_NOTE]: () => {
		test('does not throw', () => {
			expect(async () => {
				await simplifiedRunAction({
					type: ButtonActionType.CREATE_NOTE,
					folderPath: 'test',
					fileName: 'otherFile',
					openNote: false,
				});
			}).not.toThrow();
		});

		test('creates the note', async () => {
			await simplifiedRunAction({
				type: ButtonActionType.CREATE_NOTE,
				folderPath: 'test',
				fileName: 'otherFile',
				openNote: false,
			});

			expect(await testPlugin.internal.file.exists('test/otherFile.md')).toBe(true);
		});
	},
	[ButtonActionType.REPLACE_IN_NOTE]: () => {
		test('replaces single line in note', async () => {
			await testPlugin.internal.file.write('test/file.md', 'line1\nline2\nline3\n');

			await simplifiedRunAction({
				type: ButtonActionType.REPLACE_IN_NOTE,
				fromLine: 2,
				toLine: 2,
				replacement: 'newLine2',
			});

			expect(await testPlugin.internal.file.read('test/file.md')).toBe('line1\nnewLine2\nline3\n');
		});

		test('replaces multiple lines in note', async () => {
			await testPlugin.internal.file.write('test/file.md', 'line1\nline2\nline3\n');

			await simplifiedRunAction({
				type: ButtonActionType.REPLACE_IN_NOTE,
				fromLine: 2,
				toLine: 3,
				replacement: 'newLine2\nnewLine3',
			});

			expect(await testPlugin.internal.file.read('test/file.md')).toBe('line1\nnewLine2\nnewLine3\n');
		});

		describe('replaces with line number expressions', () => {
			test('file relative 1', async () => {
				await testPlugin.internal.file.write('test/file.md', 'line1\nline2\nline3\n');

				await simplifiedRunAction({
					type: ButtonActionType.REPLACE_IN_NOTE,
					fromLine: 'fileStart',
					toLine: 'fileEnd',
					replacement: 'newLine1\nnewLine2\nnewLine3',
				});

				expect(await testPlugin.internal.file.read('test/file.md')).toBe('newLine1\nnewLine2\nnewLine3');
			});

			test('file relative 2', async () => {
				await testPlugin.internal.file.write('test/file.md', 'line1\nline2\nline3');

				await simplifiedRunAction({
					type: ButtonActionType.REPLACE_IN_NOTE,
					fromLine: 'fileStart',
					toLine: 'fileEnd',
					replacement: 'newLine1\nnewLine2\nnewLine3',
				});

				expect(await testPlugin.internal.file.read('test/file.md')).toBe('newLine1\nnewLine2\nnewLine3');
			});

			test('file relative 3', async () => {
				await testPlugin.internal.file.write('test/file.md', 'line1\nline2\nline3\n');

				await simplifiedRunAction({
					type: ButtonActionType.REPLACE_IN_NOTE,
					fromLine: 'fileStart + 1',
					toLine: 'fileEnd - 1',
					replacement: 'newLine2\nnewLine3',
				});

				expect(await testPlugin.internal.file.read('test/file.md')).toBe('line1\nnewLine2\nnewLine3\n');
			});

			test('frontmatter relative 1', async () => {
				await testPlugin.internal.file.write('test/file.md', 'line1\nline2\nline3\n');

				await simplifiedRunAction({
					type: ButtonActionType.REPLACE_IN_NOTE,
					fromLine: 'frontmatterStart',
					toLine: 'frontmatterEnd',
					replacement: 'newLine2\nnewLine3',
				});

				expect(await testPlugin.internal.file.read('test/file.md')).toBe('newLine2\nnewLine3\nline2\nline3\n');
			});

			test('frontmatter relative 2', async () => {
				await testPlugin.internal.file.write('test/file.md', '---\n---\nline1\nline2\nline3\n');

				await simplifiedRunAction({
					type: ButtonActionType.REPLACE_IN_NOTE,
					fromLine: 'frontmatterStart',
					toLine: 'frontmatterEnd',
					replacement: 'newLine2\nnewLine3',
				});

				expect(await testPlugin.internal.file.read('test/file.md')).toBe(
					'newLine2\nnewLine3\nline1\nline2\nline3\n',
				);
			});

			test('frontmatter relative 3', async () => {
				await testPlugin.internal.file.write('test/file.md', '---\nfoo: bar\n---\nline1\nline2\nline3\n');

				await simplifiedRunAction({
					type: ButtonActionType.REPLACE_IN_NOTE,
					fromLine: 'frontmatterStart',
					toLine: 'frontmatterEnd',
					replacement: 'newLine2\nnewLine3',
				});

				expect(await testPlugin.internal.file.read('test/file.md')).toBe(
					'newLine2\nnewLine3\nline1\nline2\nline3\n',
				);
			});

			test('content relative 1', async () => {
				await testPlugin.internal.file.write('test/file.md', 'line1\nline2\nline3\n');

				await simplifiedRunAction({
					type: ButtonActionType.REPLACE_IN_NOTE,
					fromLine: 'contentStart',
					toLine: 'contentEnd',
					replacement: 'newLine2\nnewLine3',
				});

				expect(await testPlugin.internal.file.read('test/file.md')).toBe('newLine2\nnewLine3');
			});

			test('content relative 2', async () => {
				await testPlugin.internal.file.write('test/file.md', '---\nfoo: bar\n---\nline1\nline2\nline3\n');

				await simplifiedRunAction({
					type: ButtonActionType.REPLACE_IN_NOTE,
					fromLine: 'contentStart',
					toLine: 'contentEnd',
					replacement: 'newLine2\nnewLine3',
				});

				expect(await testPlugin.internal.file.read('test/file.md')).toBe(
					'---\nfoo: bar\n---\nnewLine2\nnewLine3',
				);
			});

			test('self relative', async () => {
				await testPlugin.internal.file.write('test/file.md', 'line1\nbutton\nline3\n');

				await testPlugin.api.buttonActionRunner.runAction(
					undefined,
					{
						type: ButtonActionType.REPLACE_IN_NOTE,
						fromLine: 'selfStart',
						toLine: 'selfEnd',
						replacement: 'no button',
					},
					testFilePath,
					{
						position: {
							// these line numbers start at 0
							lineStart: 1,
							lineEnd: 1,
						},
						isInline: false,
						isInGroup: false,
					},
					defaultClick,
				);

				expect(await testPlugin.internal.file.read('test/file.md')).toBe('line1\nno button\nline3\n');
			});
		});
	},
	[ButtonActionType.REGEXP_REPLACE_IN_NOTE]: () => {
		test('replaces in note', async () => {
			await testPlugin.internal.file.write('test/file.md', 'line1\nline2\nline3\n');

			await simplifiedRunAction({
				type: ButtonActionType.REGEXP_REPLACE_IN_NOTE,
				regexp: 'line\\d',
				replacement: 'newLine',
			});

			expect(await testPlugin.internal.file.read('test/file.md')).toBe('newLine\nnewLine\nnewLine\n');
		});
	},
	[ButtonActionType.REPLACE_SELF]: () => {
		test('replaces self', async () => {
			await testPlugin.internal.file.write('test/file.md', 'line1\nbutton\nline3\n');

			await testPlugin.api.buttonActionRunner.runAction(
				undefined,
				{
					type: ButtonActionType.REPLACE_SELF,
					replacement: 'no button',
				},
				testFilePath,
				{
					position: {
						// these line numbers start at 0
						lineStart: 1,
						lineEnd: 1,
					},
					isInline: false,
					isInGroup: false,
				},
				defaultClick,
			);

			expect(await testPlugin.internal.file.read('test/file.md')).toBe('line1\nno button\nline3\n');
		});

		test('replaces multiline self', async () => {
			await testPlugin.internal.file.write('test/file.md', 'line1\nbutton\n\nalso button\nline3\n');

			await testPlugin.api.buttonActionRunner.runAction(
				undefined,
				{
					type: ButtonActionType.REPLACE_SELF,
					replacement: 'no button',
				},
				testFilePath,
				{
					position: {
						// these line numbers start at 0
						lineStart: 1,
						lineEnd: 3,
					},
					isInline: false,
					isInGroup: false,
				},
				defaultClick,
			);

			expect(await testPlugin.internal.file.read('test/file.md')).toBe('line1\nno button\nline3\n');
		});
	},
	[ButtonActionType.INSERT_INTO_NOTE]: () => {
		test('inserts into note', async () => {
			await testPlugin.internal.file.write('test/file.md', 'line1\nline2\nline3\n');

			await simplifiedRunAction({
				type: ButtonActionType.INSERT_INTO_NOTE,
				line: 2,
				value: 'newLine2',
			});

			expect(await testPlugin.internal.file.read('test/file.md')).toBe('line1\nnewLine2\nline2\nline3\n');
		});
	},
	[ButtonActionType.INLINE_JS]: () => {
		test('does not throw', () => {
			expect(async () => {
				await simplifiedRunAction({
					type: ButtonActionType.INLINE_JS,
					code: `console.log('test')`,
				});
			}).not.toThrow();
		});
	},
	[ButtonActionType.RUN_TEMPLATER_FILE]: () => {
		test('does not throw', () => {
			expect(async () => {
				await simplifiedRunAction({
					type: ButtonActionType.RUN_TEMPLATER_FILE,
					templateFile: 'test',
				});
			}).not.toThrow();
		});
	},
};

describe('Button', () => {
	describe('Button Actions', () => {
		beforeEach(() => {
			testPlugin = new TestPlugin();
		});

		for (const [action, testFn] of Object.entries(buttonActionTests)) {
			describe(action, () => {
				testFn();
			});
		}
	});
});
