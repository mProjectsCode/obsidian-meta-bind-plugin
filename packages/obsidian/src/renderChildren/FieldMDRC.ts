import { type FieldBase } from 'packages/core/src/fields/FieldBase';
import type MetaBindPlugin from 'packages/obsidian/src/main.ts';
import { AbstractMDRC } from 'packages/obsidian/src/renderChildren/AbstractMDRC';

export class FieldMDRC extends AbstractMDRC {
	readonly base: FieldBase;

	constructor(plugin: MetaBindPlugin, base: FieldBase, containerEl: HTMLElement) {
		super(plugin, base.getFilePath(), containerEl);

		this.base = base;
		this.base.addOnUnmountCb(() => {
			this.unload();
		});
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
