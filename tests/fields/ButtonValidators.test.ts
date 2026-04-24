import { describe, expect, test } from 'bun:test';
import {
	V_CommandButtonAction,
	V_OpenButtonAction,
	V_SleepButtonAction,
	V_TemplaterCreateNoteButtonAction,
	V_UpdateMetadataButtonAction,
} from 'packages/core/src/config/validators/ButtonConfigValidators';

/** A value that cannot be coerced to string, forcing Zod to invoke the error map. */
function uncoercible(): unknown {
	return {
		[Symbol.toPrimitive](): string {
			throw new Error('Cannot coerce');
		},
	};
}

describe('ButtonConfigValidators', () => {
	describe('V_SleepButtonAction', () => {
		test('missing ms field uses singular "field" and names the description', () => {
			const result = V_SleepButtonAction.safeParse({});
			expect(result.success).toBe(false);
			if (result.success) {
				throw new Error('Expected parse to fail');
			}
			const issue = result.error.issues.find(i => i.path[0] === 'ms');
			expect(issue).toBeDefined();
			expect(issue!.message).toContain('sleep');
			expect(issue!.message).toContain('ms');
			expect(issue!.message).toContain('duration');
			expect(issue!.message).not.toContain('fields');
		});

		test('wrong type for ms reports number requirement', () => {
			const result = V_SleepButtonAction.safeParse({ type: 'sleep', ms: 'not a number' });
			expect(result.success).toBe(false);
			if (result.success) {
				throw new Error('Expected parse to fail');
			}
			const issue = result.error.issues.find(i => i.path[0] === 'ms');
			expect(issue).toBeDefined();
			expect(issue!.message).toContain('sleep');
			expect(issue!.message).toContain('ms');
			expect(issue!.message).toContain('number');
			expect(issue!.message).not.toContain('fields');
		});
	});

	describe('V_UpdateMetadataButtonAction', () => {
		test('invalid value field refers to the field as "value"', () => {
			// z.coerce.string coerces undefined, so we force a coercion failure
			// to exercise the error-map message.
			const result = V_UpdateMetadataButtonAction.safeParse({
				type: 'updateMetadata',
				bindTarget: 'foo',
				evaluate: false,
				value: uncoercible(),
			});
			expect(result.success).toBe(false);
			if (result.success) {
				throw new Error('Expected parse to fail');
			}
			expect(result.error.issues[0].message).toContain('updateMetadata');
			expect(result.error.issues[0].message).toContain("'value'");
			expect(result.error.issues[0].message).not.toContain("'value for the update'");
		});
	});

	describe('V_OpenButtonAction', () => {
		test('missing optional newTab succeeds', () => {
			const result = V_OpenButtonAction.safeParse({
				type: 'open',
				link: '[[test.md]]',
			});
			expect(result.success).toBe(true);
		});

		test('invalid newTab type reports boolean requirement without double-space', () => {
			const result = V_OpenButtonAction.safeParse({
				type: 'open',
				link: '[[test.md]]',
				newTab: 'not a boolean',
			});
			expect(result.success).toBe(false);
			if (result.success) {
				throw new Error('Expected parse to fail');
			}
			expect(result.error.issues[0].message).toContain('open');
			expect(result.error.issues[0].message).toContain('newTab');
			expect(result.error.issues[0].message).toContain('boolean');
			expect(result.error.issues[0].message).not.toContain('  ');
		});
	});

	describe('V_CommandButtonAction', () => {
		test('missing command field names the action and description', () => {
			const result = V_CommandButtonAction.safeParse({ type: 'command' });
			expect(result.success).toBe(false);
			if (result.success) {
				throw new Error('Expected parse to fail');
			}
			expect(result.error.issues[0].message).toContain('command');
			expect(result.error.issues[0].message).toContain("'command'");
			expect(result.error.issues[0].message).toContain('command to run');
		});
	});

	describe('V_TemplaterCreateNoteButtonAction', () => {
		test('missing templateFile names the action and description', () => {
			const result = V_TemplaterCreateNoteButtonAction.safeParse({ type: 'templaterCreateNote' });
			expect(result.success).toBe(false);
			if (result.success) {
				throw new Error('Expected parse to fail');
			}
			expect(result.error.issues[0].message).toContain('templaterCreateNote');
			expect(result.error.issues[0].message).toContain('templateFile');
			expect(result.error.issues[0].message).toContain('template file path');
		});
	});
});
