import {Decoration, DecorationSet, EditorView, WidgetType} from '@codemirror/view';
import {Extension, RangeSetBuilder, StateField, Transaction} from '@codemirror/state';
import {syntaxTree} from '@codemirror/language';
import {SyntaxNodeRef} from '@lezer/common';
import {editorInfoField} from 'obsidian';
import MetaBindPlugin from '../main';
import {InputFieldMarkdownRenderChild, RenderChildType} from '../InputFieldMarkdownRenderChild';
import {ViewFieldMarkdownRenderChild} from '../ViewFieldMarkdownRenderChild';

export class ViewFieldWidget extends WidgetType {
	content: string;
	filePath: string;
	plugin: MetaBindPlugin;
	viewField?: ViewFieldMarkdownRenderChild;


	constructor(content: string, filePath: string, plugin: MetaBindPlugin) {
		super();
		this.content = content;
		this.filePath = filePath;
		this.plugin = plugin;
	}

	eq(other: ViewFieldWidget): boolean {
		return other.content === this.content;
	}

	public toDOM(view: EditorView): HTMLElement {
		const div = document.createElement("code");

		this.viewField = this.plugin.api.createViewFieldFromString(this.content, RenderChildType.INLINE, this.filePath, div);
		this.viewField.load();

		return div;
	}

	public destroy(dom: HTMLElement): void {
		this.viewField?.unload();
		super.destroy(dom);
	}
}

export function createViewFieldEditorPlugin(plugin: MetaBindPlugin) {
	return StateField.define<DecorationSet>({
		create(state): DecorationSet {
			return Decoration.none;
		},

		update(oldState: DecorationSet, transaction: Transaction): DecorationSet {
			const builder = new RangeSetBuilder<Decoration>();
			const selections = transaction.selection?.ranges.map(range => [range.from, range.to]) ?? [];
			const filePath = transaction.state.field(editorInfoField).file?.path ?? "";

			syntaxTree(transaction.state).iterate({
				enter(node: SyntaxNodeRef) {
					// check for inline code
					if (node.type.name !== "inline-code") {
						return;
					}

					// check for selection and cursor
					const overlaps = selections.filter(([from, to]) => (to >= node.from - 1 && from <= node.to + 1));
					if (overlaps.length > 0) {
						return;
					}

					// check for content
					const content = transaction.state.sliceDoc(node.from, node.to);
					if (!(content.startsWith('VIEW[') && content.endsWith(']'))) {
						return;
					}

					builder.add(
						node.from,
						node.to,
						Decoration.replace({
							widget: new ViewFieldWidget(content, filePath, plugin),
						}),
					);
				},
			});

			return builder.finish();
		},

		provide(field: StateField<DecorationSet>): Extension {
			return EditorView.decorations.from(field);
		},
	});
}

export class InputFieldWidget extends WidgetType {
	content: string;
	filePath: string;
	plugin: MetaBindPlugin;
	inputField?: InputFieldMarkdownRenderChild;

	constructor(content: string, filePath: string, plugin: MetaBindPlugin) {
		super();
		this.content = content;
		this.filePath = filePath;
		this.plugin = plugin;
	}

	eq(other: InputFieldWidget): boolean {
		return other.content === this.content;
	}

	public toDOM(view: EditorView): HTMLElement {
		const div = document.createElement("code");

		this.inputField = this.plugin.api.createInputFieldFromString(this.content, RenderChildType.INLINE, this.filePath, div);
		this.inputField.load();

		return div;
	}

	public destroy(dom: HTMLElement): void {
		this.inputField?.unload();
		super.destroy(dom);
	}
}

export function createInputFieldEditorPlugin(plugin: MetaBindPlugin) {
	return StateField.define<DecorationSet>({
		create(state): DecorationSet {
			return Decoration.none;
		},

		update(oldState: DecorationSet, transaction: Transaction): DecorationSet {
			const builder = new RangeSetBuilder<Decoration>();
			const selections = transaction.selection?.ranges.map(range => [range.from, range.to]) ?? [];
			const filePath = transaction.state.field(editorInfoField).file?.path ?? "";

			syntaxTree(transaction.state).iterate({
				enter(node: SyntaxNodeRef) {
					// check for inline code
					if (node.type.name !== "inline-code") {
						return;
					}

					// check for selection and cursor
					const overlaps = selections.filter(([from, to]) => (to >= node.from - 1 && from <= node.to + 1));
					if (overlaps.length > 0) {
						return;
					}

					// check for content
					const content = transaction.state.sliceDoc(node.from, node.to);
					if (!(content.startsWith('INPUT[') && content.endsWith(']'))) {
						return;
					}

					builder.add(
						node.from,
						node.to,
						Decoration.replace({
							widget: new InputFieldWidget(content, filePath, plugin),
						}),
					);
				},
			});

			return builder.finish();
		},

		provide(field: StateField<DecorationSet>): Extension {
			return EditorView.decorations.from(field);
		},
	});
}
