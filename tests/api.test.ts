import { beforeEach, describe, expect, mock, type Mock, spyOn, test } from 'bun:test';
import { TestMetaBind } from './__mocks__/TestPlugin';
import { InputFieldMountable } from 'packages/core/src/fields/inputFields/InputFieldMountable';
import { ViewFieldMountable } from 'packages/core/src/fields/viewFields/ViewFieldMountable';
import { JsViewFieldMountable } from 'packages/core/src/fields/viewFields/JsViewFieldMountable';
import { TableMountable } from 'packages/core/src/fields/metaBindTable/TableMountable';
import { ButtonGroupMountable } from 'packages/core/src/fields/button/ButtonGroupMountable';
import { ButtonMountable } from 'packages/core/src/fields/button/ButtonMountable';
import { EmbedMountable } from 'packages/core/src/fields/embed/EmbedMountable';
import { ExcludedMountable } from 'packages/core/src/fields/excluded/ExcludedMountable';
import { FieldType, RenderChildType } from 'packages/core/src/config/APIConfigs';
import { PropPath } from 'packages/core/src/utils/prop/PropPath';
import { PropAccess, PropAccessType } from 'packages/core/src/utils/prop/PropAccess';
import { TestComponent } from './__mocks__/TestComponent';

describe('api', () => {
	let plugin = new TestMetaBind();

	beforeEach(() => {
		plugin = new TestMetaBind();
	});

	describe('createField', () => {
		test('input field', () => {
			let field = plugin.api.createField(
				FieldType.INPUT,
				'',
				{
					declaration: 'INPUT[toggle:foo]',
					renderChildType: RenderChildType.BLOCK,
				},
				true,
			);

			expect(field).toBeInstanceOf(InputFieldMountable);
		});

		test('view field', () => {
			let field = plugin.api.createField(
				FieldType.VIEW,
				'',
				{
					declaration: 'VIEW[1 + {foo}]',
					renderChildType: RenderChildType.BLOCK,
				},
				true,
			);

			expect(field).toBeInstanceOf(ViewFieldMountable);
		});

		test('js view field', () => {
			let field = plugin.api.createField(
				FieldType.JS_VIEW,
				'',
				{
					declaration: '{foo} as foo\n---\nreturn 1 + context.bound.foo',
				},
				true,
			);

			expect(field).toBeInstanceOf(JsViewFieldMountable);
		});

		test('table field', () => {
			let field = plugin.api.createField(
				FieldType.TABLE,
				'',
				{
					bindTarget: plugin.api.parseBindTarget('foo', ''),
					columns: [],
					tableHead: [],
				},
				true,
			);

			expect(field).toBeInstanceOf(TableMountable);
		});

		test('button group field', () => {
			let field = plugin.api.createField(
				FieldType.BUTTON_GROUP,
				'',
				{
					declaration: 'BUTTON[foo]',
					renderChildType: RenderChildType.BLOCK,
				},
				true,
			);

			expect(field).toBeInstanceOf(ButtonGroupMountable);
		});

		test('button field', () => {
			let field = plugin.api.createField(
				FieldType.BUTTON,
				'',
				{
					declaration: `style: primary
label: Open Meta Bind Playground
class: green-button
action:
  type: command
  command: obsidian-meta-bind-plugin:open-playground`,
					isPreview: false,
				},
				true,
			);

			expect(field).toBeInstanceOf(ButtonMountable);
		});

		test('embed field', () => {
			let field = plugin.api.createField(
				FieldType.EMBED,
				'',
				{
					content: '[[some note]]',
					depth: 1,
				},
				true,
			);

			expect(field).toBeInstanceOf(EmbedMountable);
		});

		test('excluded field', () => {
			let field = plugin.api.createField(FieldType.EXCLUDED, '', undefined, true);

			expect(field).toBeInstanceOf(ExcludedMountable);
		});
	});

	describe('createInlineFieldFromString', () => {
		test('input field', () => {
			let field = plugin.api.createInlineFieldFromString('INPUT[toggle:foo]', '', undefined);

			expect(field).toBeInstanceOf(InputFieldMountable);
		});

		test('view field', () => {
			let field = plugin.api.createInlineFieldFromString('VIEW[1 + {foo}]', '', undefined);

			expect(field).toBeInstanceOf(ViewFieldMountable);
		});

		test('button group field', () => {
			let field = plugin.api.createInlineFieldFromString('BUTTON[foo]', '', undefined);

			expect(field).toBeInstanceOf(ButtonGroupMountable);
		});
	});

	describe('isInlineFieldDeclaration', () => {
		test('input field', () => {
			expect(plugin.api.isInlineFieldDeclaration(FieldType.INPUT, 'INPUT[toggle:foo]')).toBe(true);
		});

		test('view field', () => {
			expect(plugin.api.isInlineFieldDeclaration(FieldType.VIEW, 'VIEW[1 + {foo}]')).toBe(true);
		});

		test('button group field', () => {
			expect(plugin.api.isInlineFieldDeclaration(FieldType.BUTTON_GROUP, 'BUTTON[foo]')).toBe(true);
		});

		test('not a field', () => {
			expect(plugin.api.isInlineFieldDeclaration(FieldType.INPUT, 'foo')).toBe(false);
		});

		test('wrong field', () => {
			expect(plugin.api.isInlineFieldDeclaration(FieldType.INPUT, 'VIEW[1 + {foo}]')).toBe(false);
		});
	});

	describe('createBindTarget', () => {
		test('simple bind target', () => {
			let bindTarget = plugin.api.createBindTarget('frontmatter', 'file', ['foo']);

			expect(bindTarget).toEqual({
				storageType: 'frontmatter',
				storagePath: 'file',
				storageProp: new PropPath([new PropAccess(PropAccessType.OBJECT, 'foo')]),
				listenToChildren: false,
			});
		});

		test('nested bind target', () => {
			let bindTarget = plugin.api.createBindTarget('frontmatter', 'file', ['foo', '0', 'bar']);

			expect(bindTarget).toEqual({
				storageType: 'frontmatter',
				storagePath: 'file',
				storageProp: new PropPath([
					new PropAccess(PropAccessType.OBJECT, 'foo'),
					new PropAccess(PropAccessType.ARRAY, '0'),
					new PropAccess(PropAccessType.OBJECT, 'bar'),
				]),
				listenToChildren: false,
			});
		});
	});

	describe('metadata update methods', () => {
		let bindTargetA = plugin.api.parseBindTarget('file#foo', '');
		let bindTargetB = plugin.api.parseBindTarget('file#bar', '');

		test.each(['string', 5, false, ['array']])('setting a value, then reading it reads the same value', value => {
			plugin.api.setMetadata(bindTargetA, value);

			expect(plugin.api.getMetadata(bindTargetA)).toEqual(value);
		});

		test('setting metadata on different bind target does not affect the first one', () => {
			plugin.api.setMetadata(bindTargetA, 'foo');
			plugin.api.setMetadata(bindTargetB, 'bar');

			expect(plugin.api.getMetadata(bindTargetA)).toEqual('foo');
		});

		test('update callback works correctly', () => {
			plugin.api.setMetadata(bindTargetA, 0);

			expect(plugin.api.getMetadata(bindTargetA)).toEqual(0);

			plugin.api.updateMetadata(bindTargetA, value => (value as number) + 1);

			expect(plugin.api.getMetadata(bindTargetA)).toEqual(1);
		});

		test('subscribing to metadata changes works correctly', () => {
			plugin.api.setMetadata(bindTargetA, 0);

			let lifecycle = new TestComponent();
			lifecycle.load();
			let callback = mock(() => {});
			plugin.api.subscribeToMetadata(bindTargetA, lifecycle, callback);

			plugin.api.setMetadata(bindTargetA, 1);

			// two times because the callback is called once when subscribing
			expect(callback).toHaveBeenCalledTimes(2);
			expect(callback).toHaveBeenLastCalledWith(1);
		});

		test('unsubscribing from metadata works correctly', () => {
			plugin.api.setMetadata(bindTargetA, 0);

			let lifecycle = new TestComponent();
			lifecycle.load();
			let callback = mock(() => {});
			plugin.api.subscribeToMetadata(bindTargetA, lifecycle, callback);

			plugin.api.setMetadata(bindTargetA, 1);

			lifecycle.unload();

			plugin.api.setMetadata(bindTargetA, 2);

			// two times because the callback is called once when subscribing
			expect(callback).toHaveBeenCalledTimes(2);
			expect(callback).toHaveBeenLastCalledWith(1);
		});
	});

	describe('update metadata interactions', () => {
		beforeEach(() => {
			plugin.file.create('', 'test', 'md');
		});

		test.each(['foo', 'memory^foo', 'globalMemory^foo'])('view field created after', async value => {
			const bindTarget = plugin.api.parseBindTarget(value, 'test.md');

			plugin.api.setMetadata(bindTarget, 123);

			expect(plugin.api.getMetadata(bindTarget)).toBe(123);

			const viewField = plugin.api.createViewFieldMountable('test.md', {
				declaration: `VIEW[{${value}}]`,
				renderChildType: RenderChildType.INLINE,
			});

			viewField.mount(document.body);

			await new Promise(resolve => setTimeout(resolve, 0));

			expect(viewField.viewField?.getTargetEl()?.textContent).toBe('123');
		});

		test.each(['foo', 'memory^foo', 'globalMemory^foo'])('input field created after', async value => {
			const bindTarget = plugin.api.parseBindTarget(value, 'test.md');

			plugin.api.setMetadata(bindTarget, 123);

			expect(plugin.api.getMetadata(bindTarget)).toBe(123);

			const inputField = plugin.api.createInputFieldMountable('test.md', {
				declaration: `INPUT[number:${value}]`,
				renderChildType: RenderChildType.INLINE,
			});

			inputField.mount(document.body);

			await new Promise(resolve => setTimeout(resolve, 0));

			expect(inputField.inputField?.getValue()).toBe(123);
		});

		test.each(['foo', 'memory^foo', 'globalMemory^foo'])('view field created before', async value => {
			const bindTarget = plugin.api.parseBindTarget(value, 'test.md');

			const viewField = plugin.api.createViewFieldMountable('test.md', {
				declaration: `VIEW[{${value}}]`,
				renderChildType: RenderChildType.INLINE,
			});

			viewField.mount(document.body);

			await new Promise(resolve => setTimeout(resolve, 0));

			plugin.api.setMetadata(bindTarget, 123);

			expect(plugin.api.getMetadata(bindTarget)).toBe(123);

			await new Promise(resolve => setTimeout(resolve, 0));

			expect(viewField.viewField?.getTargetEl()?.textContent).toBe('123');
		});

		test.each(['foo', 'memory^foo', 'globalMemory^foo'])('input field created before', async value => {
			const bindTarget = plugin.api.parseBindTarget(value, 'test.md');

			const inputField = plugin.api.createInputFieldMountable('test.md', {
				declaration: `INPUT[number:${value}]`,
				renderChildType: RenderChildType.INLINE,
			});

			inputField.mount(document.body);

			await new Promise(resolve => setTimeout(resolve, 0));

			plugin.api.setMetadata(bindTarget, 123);

			expect(plugin.api.getMetadata(bindTarget)).toBe(123);

			await new Promise(resolve => setTimeout(resolve, 0));

			console.log(plugin.metadataManager.getSource('globalMemory'));

			expect(inputField.inputField?.getValue()).toBe(123);
		});
	});
});
