import { AbstractMDRC } from './AbstractMDRC';
import { type FieldBase } from '../fields/IFieldBase';
import type MetaBindPlugin from '../main';

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
