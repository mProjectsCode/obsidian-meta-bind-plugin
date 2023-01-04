import { Decoration, DecorationSet, EditorView, PluginSpec, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { FrontmatterWidget } from './FrontmatterWidget';

class CmPlugin implements PluginValue {
	decorations: DecorationSet;

	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
		console.log(view);
	}

	public update(update: ViewUpdate): void {}

	public destroy(): void {}

	buildDecorations(view: EditorView): DecorationSet {
		const widgets: Decoration[] = [];

		widgets.push(Decoration.widget({ widget: new FrontmatterWidget() }));

		return Decoration.set(widgets.map(x => x.range(0)));
	}
}

const pluginSpec: PluginSpec<CmPlugin> = {
	decorations: (value: CmPlugin) => value.decorations,
};

export const cmPlugin = ViewPlugin.fromClass(CmPlugin, pluginSpec);
