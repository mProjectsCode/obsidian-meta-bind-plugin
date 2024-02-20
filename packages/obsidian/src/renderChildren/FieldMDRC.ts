import { AbstractMDRC } from 'packages/obsidian/src/renderChildren/AbstractMDRC';
import type MetaBindPlugin from 'packages/obsidian/src/main.ts';
import { type FieldBase } from 'packages/core/src/fields/IFieldBase';

export class FieldMDRC extends AbstractMDRC {
	readonly base: FieldBase;

	constructor(plugin: MetaBindPlugin, base: FieldBase, containerEl: HTMLElement) {
		super(plugin, base.getFilePath(), containerEl);

		this.base = base;
	}

	onload(): void {
		this.base.mount(this.containerEl);

		super.onload();
	}

	onunload(): void {
		this.base.unmount();

		super.onunload();
	}
}
