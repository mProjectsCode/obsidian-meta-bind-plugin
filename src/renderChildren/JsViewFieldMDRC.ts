import type MetaBindPlugin from '../main';
import { AbstractViewFieldMDRC } from './AbstractViewFieldMDRC';
import { type JsViewFieldDeclaration } from '../parsers/viewFieldParser/ViewFieldDeclaration';
import { type RenderChildType } from '../config/FieldConfigs';
import { JsViewField } from '../fields/viewFields/JsViewField';

export class JsViewFieldMDRC extends AbstractViewFieldMDRC {
	readonly base: JsViewField;

	constructor(
		plugin: MetaBindPlugin,
		filePath: string,
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		declaration: JsViewFieldDeclaration,
	) {
		super(plugin, filePath, containerEl);

		this.base = new JsViewField(plugin, this.uuid, filePath, containerEl, renderChildType, declaration);
	}

	onload(): void {
		this.base.mount();

		super.onload();
	}

	onunload(): void {
		this.base.destroy();

		super.onunload();
	}
}
