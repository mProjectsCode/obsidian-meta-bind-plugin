import { type EditorSelection, type EditorState } from '@codemirror/state';
import { editorInfoField, type TFile } from 'obsidian';
import { type DecorationSet, type EditorView } from '@codemirror/view';

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
