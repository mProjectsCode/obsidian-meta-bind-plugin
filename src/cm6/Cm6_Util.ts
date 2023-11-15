import { type EditorSelection, type EditorState } from '@codemirror/state';
import type MetaBindPlugin from '../main';
import { type Component, editorInfoField, type TFile } from 'obsidian';
import { ErrorLevel, MetaBindInternalError } from '../utils/errors/MetaBindErrors';
import { InputFieldWidget, type MarkdownRenderChildWidget, MBWidgetType, ViewFieldWidget } from './Cm6_Widgets';
import { type DecorationSet, type EditorView } from '@codemirror/view';
import { type AbstractMDRC } from '../renderChildren/AbstractMDRC';

export class Cm6_Util {
	/**
	 * Checks if a selection overlaps with a given range.
	 *
	 * @param selection
	 * @param from
	 * @param to
	 */
	static checkSelectionOverlap(selection: EditorSelection | undefined, from: number, to: number): boolean {
		if (!selection) {
			return false;
		}

		for (const range of selection.ranges) {
			if (range.to >= from && range.from <= to) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Gets the editor content of a given range.
	 *
	 * @param state
	 * @param from
	 * @param to
	 */
	static getContent(state: EditorState, from: number, to: number): string {
		return state.sliceDoc(from, to);
	}

	/**
	 * Creates a MDRC widget from a given widget type.
	 *
	 * @param widgetType
	 * @param content
	 * @param filePath
	 * @param component
	 * @param plugin
	 */
	static constructMarkdownRenderChildWidget(
		widgetType: MBWidgetType,
		content: string,
		filePath: string,
		component: Component,
		plugin: MetaBindPlugin,
	): MarkdownRenderChildWidget<AbstractMDRC> | undefined {
		if (widgetType === MBWidgetType.INPUT_FIELD_WIDGET) {
			return new InputFieldWidget(content, filePath, component, plugin);
		} else if (widgetType === MBWidgetType.VIEW_FIELD_WIDGET) {
			return new ViewFieldWidget(content, filePath, component, plugin);
		}

		return undefined;
	}

	/**
	 * Gets the prefix of a given widget type. (e.g. INPUT or VIEW)
	 *
	 * @param widgetType
	 */
	static getDeclarationPrefix(widgetType: MBWidgetType): string {
		if (widgetType === MBWidgetType.INPUT_FIELD_WIDGET) {
			return 'INPUT';
		} else if (widgetType === MBWidgetType.VIEW_FIELD_WIDGET) {
			return 'VIEW';
		}

		throw new MetaBindInternalError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'failed to get declaration prefix',
			cause: `Invalid widget type "${widgetType}"`,
		});
	}

	/**
	 * Checks if a string is a declaration of a given widget type.
	 *
	 * @param widgetType
	 * @param str
	 */
	static isDeclaration(widgetType: MBWidgetType, str: string): boolean {
		const startStr: string = Cm6_Util.getDeclarationPrefix(widgetType) + '[';
		const endStr: string = ']';

		return str.startsWith(startStr) && str.endsWith(endStr);
	}

	/**
	 * Checks if a string is any declaration and if yes returns the widget type.
	 * This does not use {@link isDeclaration} because of performance reasons.
	 *
	 * @param str
	 */
	static isDeclarationAndGetWidgetType(str: string): MBWidgetType | undefined {
		if (!str.endsWith(']')) {
			return undefined;
		}

		for (const widgetType of Object.values(MBWidgetType)) {
			const startStr: string = Cm6_Util.getDeclarationPrefix(widgetType) + '[';
			if (str.startsWith(startStr)) {
				return widgetType;
			}
		}

		return undefined;
	}

	/**
	 * Gets the current file of an editor.
	 *
	 * @param view
	 */
	static getCurrentFile(view: EditorView): TFile | null {
		// @ts-ignore some strange private field not being assignable
		return view.state.field(editorInfoField).file;
	}

	/**
	 * Checks if a decoration exists in a given range.
	 *
	 * @param decorations
	 * @param from
	 * @param to
	 */
	static existsDecorationBetween(decorations: DecorationSet, from: number, to: number): boolean {
		let exists = false;
		decorations.between(from, to, () => {
			exists = true;
		});
		return exists;
	}
}
