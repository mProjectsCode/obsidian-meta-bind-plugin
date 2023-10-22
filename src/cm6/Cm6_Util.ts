import { type EditorSelection, type EditorState } from '@codemirror/state';
import type MetaBindPlugin from '../main';
import { type Component, editorInfoField, type TFile } from 'obsidian';
import { ErrorLevel, MetaBindInternalError } from '../utils/errors/MetaBindErrors';
import { InputFieldWidget, type MarkdownRenderChildWidget, MBWidgetType, ViewFieldWidget } from './Cm6_Widgets';
import { type DecorationSet, type EditorView } from '@codemirror/view';
import { type AbstractMDRC } from '../renderChildren/AbstractMDRC';

export class Cm6_Util {
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

	static getContent(state: EditorState, from: number, to: number): string {
		return state.sliceDoc(from, to);
	}

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

	static getDeclarationPrefix(widgetType: MBWidgetType): string {
		if (widgetType === MBWidgetType.INPUT_FIELD_WIDGET) {
			return 'INPUT';
		} else if (widgetType === MBWidgetType.VIEW_FIELD_WIDGET) {
			return 'VIEW';
		}

		throw new MetaBindInternalError(ErrorLevel.ERROR, 'failed to get declaration prefix', `Invalid widget type "${widgetType}"`);
	}

	static isDeclaration(widgetType: MBWidgetType, str: string): boolean {
		const startStr: string = Cm6_Util.getDeclarationPrefix(widgetType) + '[';
		const endStr: string = ']';

		return str.startsWith(startStr) && str.endsWith(endStr);
	}

	/**
	 * Checks if a string is any declaration and if yes returns the widget type.
	 * This does not use {@link isDeclaration} because of performance reasons.
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

	static getCurrentFile(view: EditorView): TFile | null {
		return view.state.field(editorInfoField).file;
	}

	static existsDecorationBetween(decorations: DecorationSet, from: number, to: number): boolean {
		let exists = false;
		decorations.between(from, to, () => {
			exists = true;
		});
		return exists;
	}
}
