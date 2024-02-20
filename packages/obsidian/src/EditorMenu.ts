import { type Editor, type Menu, stringifyYaml } from 'obsidian';
import type MetaBindPlugin from 'packages/obsidian/src/main.ts';
import { createInputFieldInsertExamples, createViewFieldInsertExamples } from 'packages/core/src/utils/InputFieldExamples';
import { ButtonBuilderModal } from 'packages/obsidian/src/modals/ButtonBuilderModal';

export function createEditorMenu(menu: Menu, editor: Editor, plugin: MetaBindPlugin): void {
	const inputFieldExamples = createInputFieldInsertExamples(plugin);
	const viewFieldExamples = createViewFieldInsertExamples(plugin);

	menu.addItem(mbItem => {
		mbItem.setTitle('Meta Bind');
		mbItem.setIcon('blocks');

		const mbSubmenu = mbItem.setSubmenu();

		mbSubmenu.addItem(ipfItem => {
			ipfItem.setTitle('Input Field');

			const ipfSubmenu = ipfItem.setSubmenu();

			for (const [type, declaration] of inputFieldExamples) {
				ipfSubmenu.addItem(item => {
					item.setTitle(type);
					item.onClick(() => insetAtCursor(editor, declaration));
				});
			}
		});

		mbSubmenu.addItem(vfItem => {
			vfItem.setTitle('View Field');

			const vfSubmenu = vfItem.setSubmenu();

			for (const [type, declaration] of viewFieldExamples) {
				vfSubmenu.addItem(item => {
					item.setTitle(type);
					item.onClick(() => insetAtCursor(editor, declaration));
				});
			}
		});

		mbSubmenu.addItem(inlineButtonItem => {
			inlineButtonItem.setTitle('Inline Button');
			inlineButtonItem.onClick(() => {
				insetAtCursor(editor, '`BUTTON[example-id]`');
			});
		});

		mbSubmenu.addItem(buttonItem => {
			buttonItem.setTitle('Button');
			buttonItem.onClick(() => {
				new ButtonBuilderModal({
					plugin: plugin,
					onOkay: (config): void => {
						insetAtCursor(editor, `\`\`\`meta-bind-button\n${stringifyYaml(config)}\n\`\`\``);
					},
					submitText: 'Insert',
				}).open();
			});
		});
	});
}

function insetAtCursor(editor: Editor, text: string): void {
	editor.replaceSelection(text);
}
