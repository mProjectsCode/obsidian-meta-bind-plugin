import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { Range } from '@codemirror/state';
import { syntaxTree, tokenClassNodeProp } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';
import { Component, editorLivePreviewField, TFile } from 'obsidian';
import MetaBindPlugin from '../main';
import { MBWidgetType } from './Cm6_Widgets';
import { Cm6_Util } from './Cm6_Util';

export function createMarkdownRenderChildWidgetEditorPlugin(plugin: MetaBindPlugin) {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			component: Component;

			constructor(view: EditorView) {
				this.component = new Component();
				this.component.load();
				this.decorations = this.renderWidgets(view) ?? Decoration.none;
			}

			update(update: ViewUpdate) {
				// only activate in LP and not source mode
				if (!update.state.field(editorLivePreviewField)) {
					console.log('not LP');
					this.decorations = Decoration.none;
					return;
				}

				if (update.docChanged) {
					// map the changes to the decorations
					this.decorations = this.decorations.map(update.changes);

					this.updateTree(update.view);
				} else if (update.selectionSet) {
					this.updateTree(update.view);
				} else if (update.viewportChanged) {
					// if the viewport changed rerender all widgets
					this.decorations = this.renderWidgets(update.view) ?? Decoration.none;
				}
			}

			updateTree(view: EditorView) {
				for (const { from, to } of view.visibleRanges) {
					syntaxTree(view.state).iterate({
						from,
						to,
						enter: nodeRef => {
							const node = nodeRef.node;
							const { shouldRender, content, widgetType } = this.getRenderInfo(view, node);

							if (shouldRender) {
								if (widgetType !== undefined && content !== undefined) {
									// render our decoration
									this.addDecoration(node, view, content, widgetType);
								} else {
									// don't render our decoration
								}
							} else {
								if (widgetType !== undefined && content !== undefined) {
									// remove our decoration
									this.removeDecoration(node);
								} else {
									// this is not our decoration
								}
							}
						},
					});
				}
			}

			removeDecoration(node: SyntaxNode) {
				this.decorations.between(node.from - 1, node.to + 1, (from, to, value) => {
					this.decorations = this.decorations.update({
						filterFrom: from,
						filterTo: to,
						filter: (from, to, value) => false,
					});
				});
			}

			addDecoration(node: SyntaxNode, view: EditorView, content: string, widgetType: MBWidgetType) {
				const from = node.from - 1;
				const to = node.to + 1;

				// check if the decoration already exists and only add it if it does not exist
				if (Cm6_Util.existsDecorationBetween(this.decorations, from, to)) {
					return;
				}

				const currentFile = Cm6_Util.getCurrentFile(view);
				if (!currentFile) {
					return;
				}

				const newDecoration = this.renderWidget(node, widgetType, content, currentFile)?.value;
				if (!newDecoration) {
					return;
				}

				this.decorations = this.decorations.update({
					add: [{ from: from, to: to, value: newDecoration }],
				});
			}

			/**
			 * return weather to render the widget and the type of the widget to render.
			 *
			 * @param view
			 * @param node
			 */
			getRenderInfo(view: EditorView, node: SyntaxNode): { shouldRender: boolean; content: string | undefined; widgetType: MBWidgetType | undefined } {
				// get the node props
				const propsString: String | undefined = node.type.prop<String>(tokenClassNodeProp);
				const props: Set<any> = new Set(propsString?.split(' '));

				// node is inline code
				if (props.has('inline-code') && !props.has('formatting')) {
					// check for selection or cursor overlap
					const selection = view.state.selection;
					const hasSelectionOverlap = Cm6_Util.checkSelectionOverlap(selection, node.from - 1, node.to + 1);
					const content = this.readNode(view, node.from, node.to);

					return {
						shouldRender: !hasSelectionOverlap,
						content: content.content,
						widgetType: content.widgetType,
					};
				}
				return { shouldRender: false, content: undefined, widgetType: undefined };
			}

			/**
			 * reads the node, returning it's content and widgetType.
			 *
			 * @param view
			 * @param from
			 * @param to
			 */
			readNode(view: EditorView, from: number, to: number): { content: string; widgetType: MBWidgetType | undefined } {
				const content = Cm6_Util.getContent(view.state, from, to);
				return {
					content: content,
					widgetType: Cm6_Util.isDeclarationAndGetWidgetType(content),
				};
			}

			renderWidgets(view: EditorView) {
				const currentFile = Cm6_Util.getCurrentFile(view);
				if (!currentFile) {
					return;
				}

				const widgets: Range<Decoration>[] = [];
				/* before:
				 *     em for italics
				 *     highlight for highlight
				 * after:
				 *     strong for bold
				 *     strikethrough for strikethrough
				 */

				for (const range of view.visibleRanges) {
					syntaxTree(view.state).iterate({
						from: range.from,
						to: range.to,
						enter: nodeRef => {
							const node = nodeRef.node;

							const renderInfo = this.getRenderInfo(view, node);

							if (!renderInfo.shouldRender || !renderInfo.widgetType || !renderInfo.content) {
								return;
							}

							const widget = this.renderWidget(node, renderInfo.widgetType, renderInfo.content, currentFile);
							if (widget) {
								widgets.push(widget);
							}
						},
					});
				}

				return Decoration.set(widgets, true);
			}

			renderWidget(node: SyntaxNode, widgetType: MBWidgetType, content: string, currentFile: TFile) {
				const widget = Cm6_Util.constructMarkdownRenderChildWidget(widgetType, content, currentFile.path, plugin);
				if (!widget) {
					return;
				}

				return Decoration.replace({
					widget: widget,
				}).range(node.from - 1, node.to + 1);
			}

			destroy() {
				this.component.unload();
			}
		},
		{
			decorations: v => v.decorations,
		}
	);

	// return StateField.define<RangeSet<Decoration>>({
	// 	create(state): RangeSet<Decoration> {
	// 		return Decoration.none;
	// 	},
	//
	// 	update(oldState: RangeSet<Decoration>, transaction: Transaction): RangeSet<Decoration> {
	// 		const builder = new RangeSetBuilder<Decoration>();
	// 		const filePath = transaction.state.field(editorInfoField).file?.path ?? '';
	//
	// 		syntaxTree(transaction.state).iterate({
	// 			enter(node: SyntaxNodeRef) {
	// 				// check for inline code
	// 				if (node.type.name !== 'inline-code') {
	// 					return;
	// 				}
	//
	// 				// check for selection and cursor
	// 				if (Cm6_Util.checkSelectionOverlap(transaction.selection, node.from, node.to)) {
	// 					return;
	// 				}
	//
	// 				// check for content
	// 				const content = transaction.state.sliceDoc(node.from, node.to);
	// 				if (!isDeclaration(widgetType, content)) {
	// 					return;
	// 				}
	//
	// 				const widget = constructMarkdownRenderChildWidget(widgetType, content, filePath, plugin);
	// 				if (!widget) {
	// 					return;
	// 				}
	//
	// 				builder.add(
	// 					node.from,
	// 					node.to,
	// 					Decoration.replace({
	// 						widget: widget,
	// 					})
	// 				);
	// 			},
	// 		});
	//
	// 		return builder.finish();
	// 	},
	//
	// 	provide(field: StateField<DecorationSet>): Extension {
	// 		return EditorView.decorations.from(field);
	// 	},
	// });
}
