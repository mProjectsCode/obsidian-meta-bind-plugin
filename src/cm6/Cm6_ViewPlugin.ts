import { Decoration, type DecorationSet, type EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { type Range, type RangeSet } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { type SyntaxNode } from '@lezer/common';
import { Component, editorLivePreviewField, type TFile } from 'obsidian';
import type MetaBindPlugin from '../main';
import { type MBWidgetType } from './Cm6_Widgets';
import { Cm6_Util } from './Cm6_Util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMarkdownRenderChildWidgetEditorPlugin(plugin: MetaBindPlugin): ViewPlugin<any> {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			component: Component;

			constructor(view: EditorView) {
				this.component = new Component();
				this.component.load();
				this.decorations = this.renderWidgets(view) ?? Decoration.none;
			}

			update(update: ViewUpdate): void {
				// only activate in LP and not source mode
				// @ts-ignore some strange private field not being assignable
				if (!update.state.field(editorLivePreviewField)) {
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

			updateTree(view: EditorView): void {
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

			removeDecoration(node: SyntaxNode): void {
				this.decorations.between(node.from - 1, node.to + 1, (from, to, _) => {
					this.decorations = this.decorations.update({
						filterFrom: from,
						filterTo: to,
						filter: () => false,
					});
				});
			}

			addDecoration(node: SyntaxNode, view: EditorView, content: string, widgetType: MBWidgetType): void {
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

				const newDecoration: Decoration | undefined = this.renderWidget(node, widgetType, content, currentFile)
					?.value;
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
			getRenderInfo(
				view: EditorView,
				node: SyntaxNode,
			): { shouldRender: boolean; content: string | undefined; widgetType: MBWidgetType | undefined } {
				// get the node props
				// const propsString: string | undefined = node.type.prop<string>(tokenClassNodeProp);
				// workaround until bun installs https://github.com/lishid/cm-language/ correctly
				const props: Set<string> = new Set<string>(node.type.name?.split('_'));

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
			 * reads the node, returning its content and widgetType.
			 *
			 * @param view
			 * @param from
			 * @param to
			 */
			readNode(
				view: EditorView,
				from: number,
				to: number,
			): { content: string; widgetType: MBWidgetType | undefined } {
				const content = Cm6_Util.getContent(view.state, from, to);
				return {
					content: content,
					widgetType: Cm6_Util.isDeclarationAndGetWidgetType(content),
				};
			}

			renderWidgets(view: EditorView): RangeSet<Decoration> | undefined {
				const currentFile = Cm6_Util.getCurrentFile(view);
				if (!currentFile) {
					return undefined;
				}

				const widgets: Range<Decoration>[] = [];

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

							const widget = this.renderWidget(
								node,
								renderInfo.widgetType,
								renderInfo.content,
								currentFile,
							);
							if (widget) {
								widgets.push(widget);
							}
						},
					});
				}

				return Decoration.set(widgets, true);
			}

			renderWidget(
				node: SyntaxNode,
				widgetType: MBWidgetType,
				content: string,
				currentFile: TFile,
			): Range<Decoration> | undefined {
				const widget = Cm6_Util.constructMarkdownRenderChildWidget(
					widgetType,
					content,
					currentFile.path,
					this.component,
					plugin,
				);
				if (!widget) {
					return;
				}

				return Decoration.replace({
					widget: widget,
				}).range(node.from - 1, node.to + 1);
			}

			destroy(): void {
				this.component.unload();
			}
		},
		{
			decorations: v => v.decorations,
		},
	);
}
