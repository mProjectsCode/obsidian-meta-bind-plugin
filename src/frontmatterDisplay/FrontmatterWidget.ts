import { EditorView, WidgetType } from '@codemirror/view';
import FrontmatterDisplay from './FrontmatterDisplay.svelte';

export class FrontmatterWidget extends WidgetType {
	toDOM(view: EditorView): HTMLElement {
		const el = document.documentElement.createDiv();

		new FrontmatterDisplay({
			target: el,
			props: {
				frontmatter: {},
			},
		});

		return el;
	}
}
