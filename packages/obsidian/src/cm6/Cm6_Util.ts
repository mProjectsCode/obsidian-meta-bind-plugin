import type { EditorSelection, EditorState } from '@codemirror/state';
import type { DecorationSet, EditorView } from '@codemirror/view';
import type { TFile } from 'obsidian';
import { editorInfoField } from 'obsidian';

export enum MB_WidgetType {
	FIELD = 'field',
	HIGHLIGHT = 'highlight',
}

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
	 * Checks if two ranges overlap.
	 *
	 * @param fromA
	 * @param toA
	 * @param fromB
	 * @param toB
	 */
	static checkRangeOverlap(fromA: number, toA: number, fromB: number, toB: number): boolean {
		return fromA <= toB && fromB <= toA;
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

	static existsDecorationOfTypeBetween(
		decorations: DecorationSet,
		widgetType: MB_WidgetType,
		from: number,
		to: number,
	): boolean {
		let exists = false;
		decorations.between(from, to, (_from, _to, decoration) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (decoration.spec.mb_widgetType === widgetType) {
				exists = true;
			}
		});
		return exists;
	}
}
