import { EditorSelection, EditorState } from '@codemirror/state';
import MetaBindPlugin from '../main';
import { editorInfoField, MarkdownRenderChild, TFile } from 'obsidian';
import { MetaBindInternalError } from '../utils/MetaBindErrors';
import { InputFieldWidget, MarkdownRenderChildWidget, MBWidgetType, ViewFieldWidget } from './Cm6_Widgets';
import { DecorationSet, EditorView } from '@codemirror/view';

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
		plugin: MetaBindPlugin
	): MarkdownRenderChildWidget<MarkdownRenderChild> | undefined {
		if (widgetType === MBWidgetType.INPUT_FIELD_WIDGET) {
			return new InputFieldWidget(content, filePath, plugin);
		} else if (widgetType === MBWidgetType.VIEW_FIELD_WIDGET) {
			return new ViewFieldWidget(content, filePath, plugin);
		}

		return undefined;
	}

	static getDeclarationPrefix(widgetType: MBWidgetType): string {
		if (widgetType === MBWidgetType.INPUT_FIELD_WIDGET) {
			return 'INPUT';
		} else if (widgetType === MBWidgetType.VIEW_FIELD_WIDGET) {
			return 'VIEW';
		}

		throw new MetaBindInternalError(`Invalid widget type "${widgetType}"`);
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