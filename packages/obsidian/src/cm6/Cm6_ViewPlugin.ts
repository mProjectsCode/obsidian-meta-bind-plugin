import { syntaxTree } from '@codemirror/language';
import type { EditorState, Range, RangeSet } from '@codemirror/state';
import type { DecorationSet, EditorView, ViewUpdate } from '@codemirror/view';
import { Decoration, ViewPlugin } from '@codemirror/view';
import type { SyntaxNode } from '@lezer/common';
import { summary } from 'itertools-ts/es';
import type { TFile } from 'obsidian';
import { Component, editorLivePreviewField } from 'obsidian';
import type { InlineFieldType } from 'packages/core/src/config/APIConfigs';
import type { MB_WidgetSpec } from 'packages/obsidian/src/cm6/Cm6_Util';
import { Cm6_Util, MB_WidgetType } from 'packages/obsidian/src/cm6/Cm6_Util';
import type { ObsMetaBind } from 'packages/obsidian/src/main';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMarkdownRenderChildWidgetEditorPlugin(mb: ObsMetaBind): ViewPlugin<any> {
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

				view.dom.addEventListener('click', e => this.handleClick(e));
			}

			handleClick(e: MouseEvent): void {
				if (e.target instanceof HTMLElement) {
					let parent: HTMLElement | null = e.target;

					// check if the click was inside an input field
					while (parent !== null) {
						if (parent.classList.contains('mb-input')) {
							e.stopPropagation();
							// Uncommenting this will fix #403
							// but it will break date and time inputs
							// e.preventDefault();
							break;
						}

						parent = parent.parentElement;
					}
				}
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
				// this is needed because otherwise some decorations are not unloaded correctly
				this.decorations = this.decorations.update({
					filter: (fromA, toA, decoration) => {
						const inVisibleRange = summary.anyMatch(view.visibleRanges, range =>
							Cm6_Util.checkRangeOverlap(fromA, toA, range.from, range.to),
						);

						if (inVisibleRange) {
							return true;
						} else {
							const spec = decoration.spec as MB_WidgetSpec;

							spec.mb_unload?.();
							return false;
						}
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
							const spec = decoration.spec as MB_WidgetSpec;

							if (widgetTypeToKeep && spec.mb_widgetType === widgetTypeToKeep) {
								return true;
							}

							spec.mb_unload?.();
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
			 * @param inlineFieldType
			 */
			addDecoration(
				node: SyntaxNode,
				view: EditorView,
				widgetType: MB_WidgetType,
				content: string,
				inlineFieldType: InlineFieldType,
			): void {
				const from = node.from - 1;
				const to = node.to + 1;

				// we check if there already is a decoration of the same type in the range
				if (Cm6_Util.existsDecorationOfTypeBetween(this.decorations, widgetType, from, to)) {
					return;
				}

				// we can only render widgets if we have a current file
				const currentFile = Cm6_Util.getCurrentFile(view);
				if (!currentFile) {
					return;
				}

				const newDecoration: Range<Decoration> | Range<Decoration>[] = this.renderWidget(
					node,
					inlineFieldType,
					widgetType,
					content,
					currentFile,
				);
				const newDecorations = Array.isArray(newDecoration) ? newDecoration : [newDecoration];
				// the render widget function might return an empty array if the widget is not supposed to be rendered
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
				widgetType: InlineFieldType | undefined;
			} {
				// get the node props
				// const propsString: string | undefined = node.type.prop<string>(tokenClassNodeProp);
				// workaround until bun installs https://github.com/lishid/cm-language/ correctly
				const props: Set<string> = new Set<string>(node.type.name?.split('_'));

				// node is inline code
				if (props.has('inline-code') && !props.has('formatting')) {
					// check for selection or cursor overlap
					const hasSelectionOverlap = Cm6_Util.checkSelectionOverlap(
						view.state.selection,
						node.from - 1,
						node.to + 1,
					);
					const content = this.readNode(view, node.from, node.to);
					const isLivePreview = this.isLivePreview(view.state);
					// if we are in live preview mode, we only render the widget if there is no selection overlap
					// otherwise the user has it's cursor within the bounds of the code for the field and we do syntax highlighting
					// if we are not in live preview, so in source mode, we always do syntax highlighting
					const shouldRenderField = !hasSelectionOverlap && isLivePreview;

					return {
						shouldRender: shouldRenderField,
						// we need to also check that the user has highlighting enabled in the settings
						shouldHighlight: !shouldRenderField && mb.getSettings().enableSyntaxHighlighting,
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
			): { content: string; widgetType: InlineFieldType | undefined } {
				const content = Cm6_Util.getContent(view.state, from, to);
				return {
					content: content,
					widgetType: mb.api.isInlineFieldDeclarationAndGetType(content),
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
			 * @param inlineFieldType
			 * @param widgetType
			 * @param content
			 * @param currentFile
			 */
			renderWidget(
				node: SyntaxNode,
				inlineFieldType: InlineFieldType,
				widgetType: MB_WidgetType,
				content: string,
				currentFile: TFile,
			): Range<Decoration> | Range<Decoration>[] {
				if (widgetType === MB_WidgetType.FIELD) {
					const widget = mb.api.constructMDRCWidget(
						inlineFieldType,
						content,
						currentFile.path,
						this.component,
					);

					return Decoration.replace({
						widget: widget,
						mb_widgetType: MB_WidgetType.FIELD,
						mb_unload: () => {
							widget.renderChild?.unload();
						},
					}).range(node.from - 1, node.to + 1);
				} else {
					const highlight = mb.syntaxHighlighting.highlight(content, inlineFieldType, false);

					return highlight.getHighlights().map(h => {
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
