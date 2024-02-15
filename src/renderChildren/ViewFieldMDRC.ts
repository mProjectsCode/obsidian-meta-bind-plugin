import { AbstractViewFieldMDRC } from './AbstractViewFieldMDRC';
import type MetaBindPlugin from '../main';
import { type ViewFieldDeclaration } from '../parsers/viewFieldParser/ViewFieldDeclaration';
import { type RenderChildType } from '../config/FieldConfigs';
import { ViewFieldBase } from '../fields/viewFields/ViewFieldBase';

export class ViewFieldMDRC extends AbstractViewFieldMDRC {
	readonly base: ViewFieldBase;

	constructor(
		plugin: MetaBindPlugin,
		filePath: string,
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		declaration: ViewFieldDeclaration,
	) {
		super(plugin, filePath, containerEl);

		this.base = new ViewFieldBase(plugin, this.uuid, filePath, containerEl, renderChildType, declaration);
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
