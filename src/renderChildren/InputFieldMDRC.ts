import { AbstractMDRC } from './AbstractMDRC';
import type MetaBindPlugin from '../main';
import { type InputFieldDeclaration } from '../parsers/inputFieldParser/InputFieldDeclaration';
import { type RenderChildType } from '../config/FieldConfigs';
import { InputFieldBase } from '../fields/inputFields/InputFieldBase';

export class InputFieldMDRC extends AbstractMDRC {
	readonly base: InputFieldBase;

	constructor(
		plugin: MetaBindPlugin,
		filePath: string,
		containerEl: HTMLElement,
		renderChildType: RenderChildType,
		declaration: InputFieldDeclaration,
	) {
		super(plugin, filePath, containerEl);

		this.base = new InputFieldBase(plugin, this.uuid, filePath, containerEl, renderChildType, declaration);
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
