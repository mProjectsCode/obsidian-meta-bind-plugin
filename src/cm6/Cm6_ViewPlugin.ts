import { Decoration, type DecorationSet, type EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { type EditorState, type Range, type RangeSet } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { type SyntaxNode } from '@lezer/common';
import { Component, editorLivePreviewField, type TFile } from 'obsidian';
import type MetaBindPlugin from '../main';
import { Cm6_Util, MB_WidgetType } from './Cm6_Util';
import { type InlineMDRCType, InlineMDRCUtils } from '../utils/InlineMDRCUtils';
import { summary } from 'itertools-ts/es';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMarkdownRenderChildWidgetEditorPlugin(plugin: MetaBindPlugin): ViewPlugin<any> {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			/**
			 * Component for unloading the widgets if the view plugin is destroyed.
			 */
			component: Component;

			constructor(view: EditorView) {
				this.component = new Component();
				this.component.load();
				this.decorations = this.renderWidgets(view) ?? Decoration.none;
			}

			isLivePreview(state: EditorState): boolean {
				// @ts-ignore some strange private field not being assignable
				return state.field(editorLivePreviewField);
			}

			/**
			 * Triggered by codemirror when the view updates.
			 * Depending on the update type, the decorations are either updated or recreated.
			 *
			 * @param update
			 */
			update(update: ViewUpdate): void {
				this.decorations = this.decorations.map(update.changes);

				this.updateWidgets(update.view);
			}

			/**
			 * Updates all the widgets by traversing the syntax tree.
			 *
			 * @param view
			 */
			updateWidgets(view: EditorView): void {
				// remove all decorations that are not visible and call unload manually
				this.decorations = this.decorations.update({
					filter: (fromA, toA, decoration) => {
						const inVisibleRange = summary.anyMatch(view.visibleRanges, range =>
							Cm6_Util.checkRangeOverlap(fromA, toA, range.from, range.to),
						);

						if (inVisibleRange) {
							return true;
						}

						// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
						decoration.spec.mb_unload?.();
						return false;
					},
				});

				for (const { from, to } of view.visibleRanges) {
					syntaxTree(view.state).iterate({
						from,
						to,
						enter: nodeRef => {
							const node = nodeRef.node;
							const renderInfo = this.getRenderInfo(view, node);

							if (renderInfo.widgetType === undefined || renderInfo.content === undefined) {
								// not our decoration
								return;
							}

							if (renderInfo.shouldRender) {
								this.removeDecoration(node, MB_WidgetType.FIELD);
								this.addDecoration(
									node,
									view,
									MB_WidgetType.FIELD,
									renderInfo.content,
									renderInfo.widgetType,
								);
							} else if (renderInfo.shouldHighlight) {
								this.removeDecoration(node, MB_WidgetType.HIGHLIGHT);
								this.addDecoration(
									node,
									view,
									MB_WidgetType.HIGHLIGHT,
									renderInfo.content,
									renderInfo.widgetType,
								);
							} else {
								this.removeDecoration(node);
							}
						},
					});
				}
			}

			/**
			 * Removes all decorations at a given node.
			 *
			 * @param node
			 * @param widgetTypeToKeep if specified, decorations of this type are kept
			 */
			removeDecoration(node: SyntaxNode, widgetTypeToKeep?: MB_WidgetType): void {
				this.decorations.between(node.from - 1, node.to + 1, (from, to, _) => {
					this.decorations = this.decorations.update({
						filterFrom: from,
						filterTo: to,
						filter: (_from, _to, decoration) => {
							if (widgetTypeToKeep) {
								// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
								const widgetType = decoration.spec.mb_widgetType;

								if (widgetType === widgetTypeToKeep) {
									return true;
								}
							}

							// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
							decoration.spec.mb_unload?.();
							return false;
						},
					});
				});
			}

			/**
			 * Adds a widget at a given node if it does not exist yet.
			 *
			 * @param node the note where to add the widget
			 * @param view
			 * @param content the content of the node
			 * @param widgetType
			 * @param mdrcType
			 */
			addDecoration(
				node: SyntaxNode,
				view: EditorView,
				widgetType: MB_WidgetType,
				content: string,
				mdrcType: InlineMDRCType,
			): void {
				const from = node.from - 1;
				const to = node.to + 1;

				// check if the decoration already exists and only add it if it does not exist
				if (Cm6_Util.existsDecorationOfTypeBetween(this.decorations, widgetType, from, to)) {
					return;
				}

				const currentFile = Cm6_Util.getCurrentFile(view);
				if (!currentFile) {
					return;
				}

				const newDecoration: Range<Decoration> | Range<Decoration>[] = this.renderWidget(
					node,
					mdrcType,
					widgetType,
					content,
					currentFile,
				);
				const newDecorations = Array.isArray(newDecoration) ? newDecoration : [newDecoration];
				if (newDecorations.length === 0) {
					return;
				}

				this.decorations = this.decorations.update({
					add: newDecorations,
				});
			}

			/**
			 * Checks whether to render a widget at a given node and the type of the widget to render.
			 *
			 * @param view
			 * @param node
			 */
			getRenderInfo(
				view: EditorView,
				node: SyntaxNode,
			): {
				shouldRender: boolean;
				shouldHighlight: boolean;
				content: string | undefined;
				widgetType: InlineMDRCType | undefined;
			} {
				// get the node props
				// const propsString: string | undefined = node.type.prop<string>(tokenClassNodeProp);
				// workaround until bun installs https://github.com/lishid/cm-language/ correctly
				const props: Set<string> = new Set<string>(node.type.name?.split('_'));

				// console.log(props, this.readNode(view, node.from, node.to));

				// node is inline code
				if (props.has('inline-code') && !props.has('formatting')) {
					// check for selection or cursor overlap
					const selection = view.state.selection;
					const hasSelectionOverlap = Cm6_Util.checkSelectionOverlap(selection, node.from - 1, node.to + 1);
					const content = this.readNode(view, node.from, node.to);
					const isLivePreview = this.isLivePreview(view.state);

					return {
						shouldRender: !hasSelectionOverlap && isLivePreview,
						shouldHighlight:
							(hasSelectionOverlap || !isLivePreview) && plugin.settings.enableSyntaxHighlighting,
						content: content.content,
						widgetType: content.widgetType,
					};
				}
				return { shouldRender: false, shouldHighlight: false, content: undefined, widgetType: undefined };
			}

			/**
			 * Reads the content of an editor range and checks if it is a declaration if so also returning the widget type.
			 *
			 * @param view
			 * @param from
			 * @param to
			 */
			readNode(
				view: EditorView,
				from: number,
				to: number,
			): { content: string; widgetType: InlineMDRCType | undefined } {
				const content = Cm6_Util.getContent(view.state, from, to);
				return {
					content: content,
					widgetType: InlineMDRCUtils.isDeclarationAndGetMDRCType(content),
				};
			}

			/**
			 * Completely re-renders all widgets.
			 *
			 * @param view
			 */
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

							if (!renderInfo.widgetType || !renderInfo.content) {
								return;
							}

							let widget: Range<Decoration> | Range<Decoration>[] | undefined = undefined;

							if (renderInfo.shouldRender) {
								widget = this.renderWidget(
									node,
									renderInfo.widgetType,
									MB_WidgetType.FIELD,
									renderInfo.content,
									currentFile,
								);
							}

							if (renderInfo.shouldHighlight) {
								widget = this.renderWidget(
									node,
									renderInfo.widgetType,
									MB_WidgetType.HIGHLIGHT,
									renderInfo.content,
									currentFile,
								);
							}

							if (widget) {
								if (Array.isArray(widget)) {
									widgets.push(...widget);
								} else {
									widgets.push(widget);
								}
							}
						},
					});
				}

				return Decoration.set(widgets, true);
			}

			/**
			 * Renders a singe widget of the given widget type at a given node.
			 *
			 * @param node
			 * @param mdrcType
			 * @param widgetType
			 * @param content
			 * @param currentFile
			 */
			renderWidget(
				node: SyntaxNode,
				mdrcType: InlineMDRCType,
				widgetType: MB_WidgetType,
				content: string,
				currentFile: TFile,
			): Range<Decoration> | Range<Decoration>[] {
				if (widgetType === MB_WidgetType.FIELD) {
					const widget = InlineMDRCUtils.constructMDRCWidget(
						mdrcType,
						content,
						currentFile.path,
						this.component,
						plugin,
					);

					return Decoration.replace({
						widget: widget,
						mb_widgetType: MB_WidgetType.FIELD,
						mb_unload: () => {
							widget.renderChild?.unload();
						},
					}).range(node.from - 1, node.to + 1);
				} else {
					const highlight = plugin.api.syntaxHighlighting.highlight(content, mdrcType, false);

					return highlight.getHighlights().map(h => {
						// console.log(h);
						return Decoration.mark({
							class: `mb-highlight-${h.tokenClass}`,
						}).range(node.from + h.range.from.index, node.from + h.range.to.index);
					});
				}
			}

			/**
			 * Triggered by codemirror when the view plugin is destroyed.
			 * Unloads all widgets.
			 */
			destroy(): void {
				this.component.unload();
			}
		},
		{
			decorations: v => v.decorations,
		},
	);
}
